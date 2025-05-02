import User from '@Auth/models/auth.model';
import { createJWT, hashPassword, comparePassword, verifyJWT, isPasswordSecure, generateOTP, parseDurationToMs } from '@utils/helpers/utilities.services';
import { IUser, IUserResponse } from '@Auth/interfaces/auth.interface';
import { Service } from 'typedi';
import { HttpException } from '../../../utils/exceptions/httpException';
import { resetPasswordEmail, sendOtpEmail } from '@utils/mail/mailer';
import jwt from 'jsonwebtoken';
import { FORGOT_PASSWORD_TOKEN_EXPIRY, FRONTEND_URL, REMEMBER_ME_TOKEN_EXPIRY, SECRET_KEY, OTP_LENGTH, OTP_EXPIRY_TIME_MIN, TOKEN_EXPIRY, RESET_WINDOW_MINUTES, LOGIN_ATTEMPT } from '@config/index';
import { messages, status } from '@utils/helpers/api.responses';
import Role from '@Role/models/role.model';


// refersh Token

@Service()
export class AuthService {


    public async login(email: string, password: string, rememberMe: boolean, language: string): Promise<{ user: Partial<IUserResponse>; token: string }> {
        try {
            const user = await User.findOne({
                email: { $regex: new RegExp(`^${email}$`, 'i') }
            })
            const role = await Role.findById(user.roleId)

            if (!user) {
                throw new HttpException(status.Unauthorized, messages[language].General.invalid.replace('##', messages[language].User.loginFailed));
            }

            if (user.lockUntil && user.lockUntil >= new Date()) {
                throw new HttpException(status.Unauthorized, messages[language].User.AccountLock);
            }
            const jwtExpiry = rememberMe ? REMEMBER_ME_TOKEN_EXPIRY : TOKEN_EXPIRY
            const expiryDate = new Date(Date.now() + parseDurationToMs(jwtExpiry));

            const isPasswordValid = await comparePassword(password, user.accountSetting.passwordHash);

            if (!isPasswordValid) {
                user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                const remainingAttempts = Number(LOGIN_ATTEMPT) - user.failedLoginAttempts;

                if (user.failedLoginAttempts >= Number(LOGIN_ATTEMPT)) {
                    user.lockUntil = new Date(Date.now() + 4 * 60 * 1000);
                    const resetTokenResult = createJWT(user, jwtExpiry);
                    const resetToken = typeof resetTokenResult === "string" ? resetTokenResult : resetTokenResult.token;
                    const resetTokenExpiry = new Date(Date.now() + parseDurationToMs(FORGOT_PASSWORD_TOKEN_EXPIRY) * 60 * 1000);

                    user.forgotPassword = resetToken;
                    user.forgotpasswordTokenExpiry = resetTokenExpiry;
                    user.isFirstTimeResetPassword = true;
                    user.isVerifiedOtp = true;
                    user.isVerifyOtpAt = new Date();

                    const resetLink = `${FRONTEND_URL}/auth/reset-password/change?token=${resetToken}`;
                    await resetPasswordEmail(user.email, resetLink, user.fullName);

                    await user.save();
                    throw new HttpException(status.Unauthorized, 'Too many failed attempts. A password reset link has been sent to your email.');
                } else {
                    await user.save();
                    throw new HttpException(
                        status.Unauthorized,
                        messages[language].User.emailOrpassword.replace("##", remainingAttempts)
                    );
                }
            }

            user.failedLoginAttempts = 0;
            user.lockUntil = null;




            const { token } = createJWT(user, jwtExpiry);

            await User.updateOne(
                { _id: user._id },
                {
                    'accountSetting.lastLogin': new Date(),
                    token,
                    tokenExpiry: expiryDate,
                    failedLoginAttempts: 0,
                    lockUntil: null
                }
            );



            return {
                user: {
                    _id: user._id.toString(),
                    email: user.email,
                    fullName: user.fullName,
                    roleName: role.name,
                    isActive: user.isActive,

                },
                token,
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }


    public async forgotPassword(email: string, language: string): Promise<void> {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                throw new HttpException(status.NotFound, messages[language].General.not_found.replace('##', messages[language].User.email));
            }

            const otp = generateOTP(Number(OTP_LENGTH));



            const otpExpiresAt = new Date(Date.now() + parseDurationToMs(OTP_EXPIRY_TIME_MIN) * 60 * 1000);

            const forgotpasswordToken = jwt.sign({ email: email, otp: otp, _id: user._id, password: user.accountSetting.passwordHash }, SECRET_KEY, { expiresIn: '5m' });
            const ForgottokenExpiry = new Date(Date.now() + parseDurationToMs(OTP_EXPIRY_TIME_MIN) * 60 * 60 * 1000);

            await Promise.all([
                User.updateOne(
                    { _id: user._id },
                    { otp: otp, otpExpiresAt, otpCreatedAt: new Date(), isVerifiedOtp: false, forgotPassword: forgotpasswordToken, forgotpasswordTokenExpiry: ForgottokenExpiry }
                ),

                sendOtpEmail(user.email, otp, user.accountSetting.userName ?? email)
            ])

            // return forgotpasswordToken;

        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async resendOtp(email: string, language: string): Promise<string> {
        try {
            const user = await User.findOne({ email: email, isVerifiedOtp: false });


            if (!user) {
                throw new HttpException(status.NotFound, messages[language].General.not_found.replace('##', messages[language].User.user));
            }

            const otp = generateOTP(Number(OTP_LENGTH));



            const otpExpiresAt = new Date(Date.now() + 1000 * 60 * parseDurationToMs(OTP_EXPIRY_TIME_MIN));

            const token = jwt.sign({ email: user.email, otp: otp, _id: user._id, password: user.accountSetting.passwordHash }, SECRET_KEY, { expiresIn: '5m' });
            const tokenExpiry = new Date(Date.now() + parseDurationToMs(OTP_EXPIRY_TIME_MIN) * 60 * 60 * 1000);

            await Promise.all([
                User.updateOne(
                    { _id: user._id },
                    { otp: otp, otpExpiresAt, otpCreatedAt: new Date(), isVerifiedOtp: false, forgotPassword: token, forgotpasswordTokenExpiry: tokenExpiry }
                ),
                sendOtpEmail(user.email, otp, user.accountSetting.userName ?? user.email)
            ])

            return token;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error)
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }


    public async verifyOTP(email: string, otp: string, language: string): Promise<void> {
        try {

            if (!email || !otp) {
                throw new HttpException(status.BadRequest, messages[language].General.invalid.replace('##', messages[language].User.otp));
            }



            const user = await User.findOne({ email: email, isActive: true, isVerifiedOtp: false });



            if (!user) {
                throw new HttpException(status.NotFound, messages[language].General.invalid.replace('##', messages[language].User.email));
            }

            verifyJWT(user.forgotPassword)

            if (user.forgotpasswordTokenExpiry && new Date() > user.forgotpasswordTokenExpiry) {
                throw new HttpException(status.Unauthorized, messages[language].General.invalid.replace('##', messages[language].User.token));
            }

            if (new Date() > user.otpExpiresAt!) {
                await User.updateOne(
                    { _id: user._id },
                    { otp: null, otpExpiresAt: null, otpCreatedAt: null }
                );
                throw new HttpException(status.BadRequest, messages[language].User.otpExpired);
            }

            if (user.otp !== otp) {
                throw new HttpException(status.BadRequest, messages[language].General.invalid.replace('##', messages[language].User.otp));
            }
            await User.updateOne(
                { _id: user._id },
                { otp: null, otpExpiresAt: null, otpCreatedAt: null, isVerifiedOtp: true, isVerifyOtpAt: Date.now() }
            );
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async resetPassword(email: string, newPassword: string, confirmPassword: string, language: string): Promise<void> {
        try {
            const [user, passwordHash] = await Promise.all([
                User.findOne({ email: email, isVerifiedOtp: true }),
                hashPassword(newPassword)
            ])
            if (!user) {
                throw new HttpException(status.Unauthorized, messages[language].General.invalid.replace('##', messages[language].User.user));
            }


            const resetWindowExpiry = new Date(user.isVerifyOtpAt.getTime() + parseDurationToMs(RESET_WINDOW_MINUTES) * 60 * 1000);

            if (new Date() > resetWindowExpiry && user.isFirstTimeResetPassword !== true) {
                throw new HttpException(status.Unauthorized, messages[language].General.invalid.replace('##', messages[language].User.token))
            }


            if (!newPassword || !confirmPassword) {
                throw new HttpException(status.BadRequest, messages[language].General.invalid.replace('##', messages[language].User.password));
            }

            if (newPassword !== confirmPassword) {
                throw new HttpException(status.BadRequest, messages[language].General.does_not_match.replace('##', messages[language].User.password).replace("%%", messages[language].User.match));
            }

            const isValidPassword = isPasswordSecure(newPassword);
            if (!isValidPassword) {
                throw new HttpException(status.BadRequest, messages[language].User.passwordInvalid);
            }

            if (await comparePassword(newPassword, user.accountSetting.passwordHash)) {
                throw new HttpException(status.BadRequest, messages[language].User.YouCanNotUsePrevious);
            }

            await User.updateOne(
                { _id: user._id },
                { failedLoginAttempts: 0, rememberMeToken: null, lockUntil: null, isFirstTimeResetPassword: null, 'accountSetting.passwordHash': passwordHash, isVerifiedOtp: null, passwordUpdatedAt: new Date(), forgotPassword: null, forgotpasswordTokenExpiry: null, token: null, tokenExpiry: null }
            );
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async getAllUser(createdBy: string, language: string = 'English'): Promise<IUser[]> {
        try {
            return await User.find({ createdBy }).select(
                '-accountSetting  -rememberMeToken -permissions -restrictedPermissions -forgotPassword -forgotpasswordTokenExpiry -tokenExpiry -isFirstTimeResetPassword -failedLoginAttempts -lockUntil -otp -otpCreatedAt -otpExpiresAt -isDeleted -deletedAt -token -isVerifiedOtp -isVerifyOtpAt -isPasswordUpdate -passwordUpdatedAt -isActive');
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async logout(user: IUser, language: string = 'English'): Promise<boolean> {
        try {
            if (!user._id) {
                throw new HttpException(status.Unauthorized, messages[language].General.not_found.replace('##', messages[language].User.user));
            }

            await User.updateOne(
                { _id: user._id },
                { token: null, tokenExpiry: null, forgotPassword: null, forgotpasswordTokenExpiry: null, rememberMeToken: null }
            );
            return true;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }
    public async getByUserId(userId: string, language: string = 'English'): Promise<Partial<IUserResponse>> {
        try {
            if (!userId) {
                throw new HttpException(status.BadRequest, messages[language].General.not_found.replace('##', messages[language].User.user));
            }

            const user = await User.findById(userId).select([
                '_id',
                'email',
                'fullName',
                'joiningDate',
                'notificationPreferences',
                'accountSetting.userName'
            ]);

            if (!user || user.isDeleted) {
                throw new HttpException(status.NotFound, messages[language].General.not_found.replace('##', messages[language].User.user));
            }

            return {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                joiningDate: user.joiningDate,
                notificationPreferences: user.notificationPreferences,
                accountSetting: {
                    userName: user.accountSetting?.userName
                }
            };

        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

}