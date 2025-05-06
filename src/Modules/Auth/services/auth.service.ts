import User from '@Auth/models/auth.model';
import {
    createJWT,
    hashPassword,
    comparePassword,
    verifyJWT,
    isPasswordSecure,
    generateOTP,
    parseDurationToMs,
    hashToken,
    compareToken,
} from '@utils/helpers/utilities.services';
import { IUser, IUserResponse } from '@Auth/interfaces/auth.interface';
import { Service } from 'typedi';
import { HttpException } from '@utils/exceptions/httpException';
import { resetPasswordEmail, sendOtpEmail } from '@utils/mail/mailer';
import {
    FORGOT_PASSWORD_TOKEN_EXPIRY,
    FRONTEND_URL,
    REMEMBER_ME_TOKEN_EXPIRY,
    SECRET_KEY,
    REFRESH_TOKEN,
    OTP_LENGTH,
    OTP_EXPIRY_TIME_MIN,
    TOKEN_EXPIRY,
    RESET_WINDOW_MINUTES,
    LOGIN_ATTEMPT,
    REFRESH_TOKEN_EXPIRY,
} from '@config/index';
import { messages, status } from '@utils/helpers/api.responses';

import { sign } from 'jsonwebtoken';
import ProjectManager from '@ProjectManager/models/projectManager.model';

@Service()
export class AuthService {


    public async login(
        email: string,
        password: string,
        isRememberMe: boolean,
        language: string
    ): Promise<{ user: Partial<IUserResponse>; token: string; refreshToken: string }> {
        try {
            const user = await User.findOne({
                email: { $regex: new RegExp(`^${email}$`, 'i') },
            }).populate('roleId');

            if (!user) {
                throw new HttpException(
                    status.NotFound,
                    messages[language].General.invalid.replace('##', messages[language].User.loginFailed)
                );
            }
            if (user.passwordExpiryDate && new Date() > user.passwordExpiryDate) {
                throw new HttpException(status.Forbidden, messages[language].General.expired.replace("##", messages[language].User.password))
            }
            if (user.lockUntil && user.lockUntil >= new Date()) {
                throw new HttpException(status.Unauthorized, messages[language].User.AccountLock);
            }

            const isPasswordValid = await comparePassword(password, user.accountSetting.passwordHash);
            if (!isPasswordValid) {
                user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                const remainingAttempts = Number(LOGIN_ATTEMPT) - user.failedLoginAttempts;

                if (user.failedLoginAttempts >= Number(LOGIN_ATTEMPT)) {
                    user.lockUntil = new Date(Date.now() + 4 * 60 * 1000);
                    const { accessToken: resetToken } = createJWT(user, FORGOT_PASSWORD_TOKEN_EXPIRY);
                    const resetTokenExpiry = new Date(Date.now() + parseDurationToMs(FORGOT_PASSWORD_TOKEN_EXPIRY));

                    user.forgotPassword = resetToken;
                    user.forgotpasswordTokenExpiry = resetTokenExpiry;
                    user.isFirstTimeResetPassword = true;
                    user.isVerifiedOtp = true;
                    user.isVerifyOtpAt = new Date();

                    const resetLink = `${FRONTEND_URL}/auth/reset-password/change?token=${resetToken}`;
                    await resetPasswordEmail(user.email, resetLink, user.fullName);

                    await user.save();

                    throw new HttpException(
                        status.Unauthorized,
                        'Too many failed attempts. A password reset link has been sent to your email.'
                    );
                } else {
                    await user.save();
                    throw new HttpException(
                        status.Unauthorized,
                        messages[language].User.emailOrpassword.replace('##', remainingAttempts)
                    );
                }
            }

            const jwtExpiry = isRememberMe ? REMEMBER_ME_TOKEN_EXPIRY : TOKEN_EXPIRY;
            const expiryDate = new Date(Date.now() + parseDurationToMs(jwtExpiry));

            const { accessToken, refreshToken, sessionId } = createJWT(user, jwtExpiry);
            const hashedRefreshToken = await hashToken(refreshToken);
            const refreshTokenExpiry = new Date(Date.now() + parseDurationToMs('7d'));

            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        'accountSetting.lastLogin': new Date(),
                        token: accessToken,
                        refreshToken: hashedRefreshToken,
                        refreshTokenExpiry,
                        tokenExpiry: expiryDate,
                        sessionId,
                        failedLoginAttempts: 0,
                        lockUntil: null,
                        isRememberMe
                    },
                }
            );

            return {
                user: {
                    _id: user._id.toString(),
                    email: user.email,
                    fullName: user.fullName,
                    roleName: (user.roleId as any).name,
                    isActive: user.isActive,
                },
                token: accessToken,
                refreshToken,
            };
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }



    public async logout(userId: string, language: string = 'English'): Promise<boolean> {
        try {
            if (!userId) {
                throw new HttpException(
                    status.Unauthorized,
                    messages[language].General.not_found.replace('##', messages[language].User.user)
                );
            }

            await User.updateOne(
                { _id: userId },
                {
                    token: null,
                    tokenExpiry: null,
                    refreshToken: null,
                    refreshTokenExpiry: null,
                    sessionId: null,
                    forgotPassword: null,
                    forgotpasswordTokenExpiry: null,
                }
            );
            return true;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async forgotPassword(email: string, language: string): Promise<void> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new HttpException(
                    status.NotFound,
                    messages[language].General.not_found.replace('##', messages[language].User.email)
                );
            }

            const otp = generateOTP(Number(OTP_LENGTH));
            const otpExpiresAt = new Date(Date.now() + parseDurationToMs(OTP_EXPIRY_TIME_MIN) * 60 * 1000);

            const forgotpasswordToken = sign(
                { email, otp, _id: user._id, password: user.accountSetting.passwordHash },
                SECRET_KEY,
                { expiresIn: '5m' }
            );
            const forgotTokenExpiry = new Date(Date.now() + parseDurationToMs(FORGOT_PASSWORD_TOKEN_EXPIRY));

            await Promise.all([
                User.updateOne(
                    { _id: user._id },
                    {
                        otp,
                        otpExpiresAt,
                        otpCreatedAt: new Date(),
                        isVerifiedOtp: false,
                        forgotPassword: forgotpasswordToken,
                        forgotpasswordTokenExpiry: forgotTokenExpiry,
                    }
                ),
                sendOtpEmail(user.email, otp, user.accountSetting.userName ?? email),
            ]);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async resendOtp(email: string, language: string): Promise<string> {
        try {
            const user = await User.findOne({ email, isVerifiedOtp: false });
            if (!user) {
                throw new HttpException(
                    status.NotFound,
                    messages[language].General.not_found.replace('##', messages[language].User.user)
                );
            }

            const otp = generateOTP(Number(OTP_LENGTH));
            const otpExpiresAt = new Date(Date.now() + parseDurationToMs(OTP_EXPIRY_TIME_MIN) * 60 * 1000);

            const token = sign(
                { email: user.email, otp, _id: user._id, password: user.accountSetting.passwordHash },
                SECRET_KEY,
                { expiresIn: '5m' }
            );
            const tokenExpiry = new Date(Date.now() + parseDurationToMs(FORGOT_PASSWORD_TOKEN_EXPIRY));

            await Promise.all([
                User.updateOne(
                    { _id: user._id },
                    {
                        otp,
                        otpExpiresAt,
                        otpCreatedAt: new Date(),
                        isVerifiedOtp: false,
                        forgotPassword: token,
                        forgotpasswordTokenExpiry: tokenExpiry,
                    }
                ),
                sendOtpEmail(user.email, otp, user.accountSetting.userName ?? user.email),
            ]);

            return token;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async verifyOTP(email: string, otp: string, language: string): Promise<void> {
        try {
            if (!email || !otp) {
                throw new HttpException(
                    status.BadRequest,
                    messages[language].General.invalid.replace('##', messages[language].User.otp)
                );
            }

            const user = await User.findOne({ email, isActive: true, isVerifiedOtp: false });
            if (!user) {
                throw new HttpException(
                    status.NotFound,
                    messages[language].General.invalid.replace('##', messages[language].User.email)
                );
            }

            verifyJWT(user.forgotPassword);

            if (user.forgotpasswordTokenExpiry && new Date() > user.forgotpasswordTokenExpiry) {
                throw new HttpException(
                    status.Unauthorized,
                    messages[language].General.invalid.replace('##', messages[language].User.token)
                );
            }

            if (new Date() > user.otpExpiresAt!) {
                await User.updateOne(
                    { _id: user._id },
                    { otp: null, otpExpiresAt: null, otpCreatedAt: null }
                );
                throw new HttpException(status.BadRequest, messages[language].User.otpExpired);
            }

            if (user.otp !== otp) {
                throw new HttpException(
                    status.BadRequest,
                    messages[language].General.invalid.replace('##', messages[language].User.otp)
                );
            }

            await User.updateOne(
                { _id: user._id },
                {
                    otp: null,
                    otpExpiresAt: null,
                    otpCreatedAt: null,
                    isVerifiedOtp: true,
                    isVerifyOtpAt: new Date(),
                }
            );
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async resetPassword(
        email: string,
        newPassword: string,
        confirmPassword: string,
        language: string
    ): Promise<void> {
        try {
            const [user, passwordHash] = await Promise.all([
                User.findOne({ email, isVerifiedOtp: true }),
                hashPassword(newPassword),
            ]);

            if (!user) {
                throw new HttpException(
                    status.Unauthorized,
                    messages[language].General.invalid.replace('##', messages[language].User.user)
                );
            }

            const resetWindowExpiry = new Date(
                user.isVerifyOtpAt.getTime() + parseDurationToMs(RESET_WINDOW_MINUTES) * 60 * 1000
            );
           

            if (new Date() > resetWindowExpiry && user.isFirstTimeResetPassword !== true) {
                throw new HttpException(
                    status.Unauthorized,
                    messages[language].General.invalid.replace('##', messages[language].User.token)
                );
            }

            if (!newPassword || !confirmPassword) {
                throw new HttpException(
                    status.BadRequest,
                    messages[language].General.invalid.replace('##', messages[language].User.password)
                );
            }

            if (newPassword !== confirmPassword) {
                throw new HttpException(
                    status.BadRequest,
                    messages[language].General.does_not_match
                        .replace('##', messages[language].User.password)
                        .replace('%%', messages[language].User.match)
                );
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
                {
                    $set: {
                        'accountSetting.passwordHash': passwordHash,
                        passwordUpdatedAt: new Date(),
                    },
                    $unset: {
                        isVerifiedOtp: "",
                        isVerifyOtpAt: "",
                        forgotPassword: "",
                        forgotpasswordTokenExpiry: "",
                        token: "",
                        tokenExpiry: "",
                        refreshToken: "",
                        refreshTokenExpiry: "",
                        sessionId: "",
                        isFirstTimeResetPassword: "",
                        failedLoginAttempts: "",
                        lockUntil: "",
                    }
                }
            )
            const isProjectManager = await ProjectManager.exists({ userId: user._id });
            if (isProjectManager) {
                await User.updateOne(
                    { _id: user._id, 'inviteStatus': { $ne: 'Accept' } },
                    {
                        $set: {
                            inviteStatus: 'Accept',
                            acceptedInviteAt: new Date()
                        }
                    }
                )
            }

        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async getAllUser(createdBy: string, language: string = 'English'): Promise<IUser[]> {
        try {
            return await User.find({ createdBy }).select(
                '-accountSetting -permissions -restrictedPermissions -forgotPassword -forgotpasswordTokenExpiry -tokenExpiry -isFirstTimeResetPassword -failedLoginAttempts -lockUntil -otp -otpCreatedAt -otpExpiresAt -isDeleted -deletedAt -token -isVerifiedOtp -isVerifyOtpAt -isPasswordUpdate -passwordUpdatedAt -isActive -refreshToken -refreshTokenExpiry -sessionId'
            );
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async getByUserId(userId: string, language: string = 'English'): Promise<Partial<IUserResponse>> {
        try {
            if (!userId) {
                throw new HttpException(
                    status.BadRequest,
                    messages[language].General.not_found.replace('##', messages[language].User.user)
                );
            }

            const user = await User.findById(userId).select([
                '_id',
                'email',
                'fullName',
                'joiningDate',
                'notificationPreferences',
                'accountSetting.userName',
            ]);

            if (!user || user.isDeleted) {
                throw new HttpException(
                    status.NotFound,
                    messages[language].General.not_found.replace('##', messages[language].User.user)
                );
            }

            return {
                _id: user._id.toString(),
                email: user.email,
                fullName: user.fullName,
                joiningDate: user.joiningDate,
                notificationPreferences: user.notificationPreferences,
                accountSetting: {
                    userName: user.accountSetting?.userName,
                },
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].General.error);
        }
    }

    public async refreshAccessToken(
        refreshToken: string,
        language: string = 'English'
    ): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const decoded = verifyJWT(refreshToken, REFRESH_TOKEN);
            const user = await User.findById(decoded._id).populate('roleId');

            if (!user || !user.refreshToken || !user.sessionId) {
                throw new HttpException(status.Unauthorized, messages[language].General.invalid.replace("##", messages[language].User.refreshToken));
            }

            if (user.sessionId !== decoded.sessionId) {
                throw new HttpException(status.Unauthorized, messages[language].General.sessionExpired);
            }

            const isValidRefreshToken = await compareToken(refreshToken, user.refreshToken);
            if (!isValidRefreshToken) {
                throw new HttpException(status.Unauthorized, messages[language].General.invalid.replace("##", messages[language].User.refreshToken));
            }

            if (user.refreshTokenExpiry && new Date() > user.refreshTokenExpiry) {
                await User.updateOne(
                    { _id: user._id },
                    { refreshToken: null, refreshTokenExpiry: null, sessionId: null }
                );
                throw new HttpException(status.Unauthorized, messages[language].General.invalid.replace("##", messages[language].User.refreshToken));
            }

            const { accessToken, refreshToken: newRefreshToken, sessionId } = createJWT(user, TOKEN_EXPIRY);
            const hashedNewRefreshToken = await hashToken(newRefreshToken);
            const newRefreshTokenExpiry = new Date(Date.now() + parseDurationToMs(REFRESH_TOKEN_EXPIRY));
            const tokenEx = user.isRememberMe ? parseDurationToMs(REMEMBER_ME_TOKEN_EXPIRY) : parseDurationToMs(TOKEN_EXPIRY)

            await User.updateOne(
                { _id: user._id },
                {
                    token: accessToken,
                    refreshToken: hashedNewRefreshToken,
                    refreshTokenExpiry: newRefreshTokenExpiry,
                    sessionId,
                    tokenExpiry: tokenEx,
                }
            );

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.Unauthorized, messages[language].General.invalid.replace("##", messages[language].User.refreshToken));
        }
    }

}
