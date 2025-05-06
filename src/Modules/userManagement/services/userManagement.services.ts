import User from "@Auth/models/auth.model";
import { FRONTEND_URL, TOKEN_EXPIRY } from "@config/index";
import { HttpException } from "@exceptions/httpException";
import { messages, status } from "@helpers/api.responses";
import { createJWT, parseDurationToMs } from "@helpers/utilities.services";
import { resetPasswordEmail } from "@mail/mailer";
import Role from "@Role/models/role.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import ProjectManager from "@ProjectManager/models/projectManager.model";
import { Service } from "typedi";
import TeamMember from "@userManagement/models/teamMember.model";

const teamMemberRoles = [
    'UI/UX Designer', 'HTML Developer', 'Frontend Developer',
    'Backend Developer', 'Full stack Developer', 'QA',
    'Sales', 'BA', 'Other'
];

@Service()
export class userManagementService {

    // for generate random passowrd while creating user's
    private generateRandomPassword(length: number = 12): string {
        return crypto.randomBytes(length).toString("hex").slice(0, length);
    }
    // create user's function 
    public async createUser(data: any, createdBy: string, language: string) {
        try {
            const [existingUser, role] = await Promise.all([
                User.findOne({ email: data.email }).lean(),
                Role.findById(data.roleId.toString()).lean()
            ])
            if (existingUser?.isDeleted === true) { // functionality if user come after deleting
                const [, res] = await Promise.all([
                    await User.updateOne(
                        { email: data.email },
                        {
                            $set: {
                                isDeleted: false,
                                isActive: true,
                                deletedAt: null,
                                createdAt: Date.now(),
                                passwordUpdatedAt: null,
                            },
                            $unset: {
                                forgotPassword: "",
                                forgotpasswordTokenExpiry: "",
                                token: "",
                                tokenExpiry: "",
                                refreshToken: "",
                                refreshTokenExpiry: "",
                                sessionId: "",
                                isVerifiedOtp: "",
                                isVerifyOtpAt: "",
                            }
                        }
                    ),
                    User.findOne({ email: data.email }).select("-accountSetting.passwordHash -forgotPassword -tokenExpiry").lean()
                ])
                return res
            }
            if (existingUser) {
                throw new HttpException(status.ResourceExist, messages[language].General.already_exist.replace("##", messages[language].User.email))
            }
            if (!role) {
                throw new HttpException(
                    status.BadRequest,
                    messages[language].General.not_found.replace("##", messages[language].Role.role)
                );
            }
            if (role.name === "Admin") {
                throw new HttpException(
                    status.Forbidden,
                    messages[language].General.Permission
                );
            }


            const randomPassword = this.generateRandomPassword();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const newUser = await User.create({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                roleId: role._id,

                accountSetting: {
                    passwordHash: hashedPassword,
                },
                isActive: true,
                isDeleted: false,
                joiningDate: new Date(),
                invitedAt: new Date(),
                createdBy: createdBy.toString(),
                inviteStatus: 'WaitingToAccept',



            });

            const resetTokenResult = createJWT(newUser, parseDurationToMs(TOKEN_EXPIRY))
            const resetToken =
                typeof resetTokenResult === "string"
                    ? resetTokenResult
                    : resetTokenResult.accessToken;
            const resetTokenExpiry = new Date(
                Date.now() + parseDurationToMs(TOKEN_EXPIRY)
            );

            newUser.forgotPassword = resetToken;
            newUser.forgotpasswordTokenExpiry = resetTokenExpiry;
            newUser.isFirstTimeResetPassword = true;
            newUser.isVerifiedOtp = true;
            newUser.isVerifyOtpAt = new Date();

            await newUser.save()

            const userData = await User.findById(newUser._id).select("-accountSetting.passwordHash -forgotPassword -tokenExpiry").lean();
            if (role.name === "Project Manager") {
                await ProjectManager.create({ userId: newUser._id });
                const fName = data.firstName + data.lastName

                const resetLink = `${FRONTEND_URL}/auth/reset-password/change?token=${resetToken}`;
                await resetPasswordEmail(newUser.email, resetLink, fName);
            }


            if (teamMemberRoles.includes(role.name)) {
                await TeamMember.create({
                    userId: newUser._id,
                    assignedProjects: [],
                    status: 'Active',
                });
            }

            return userData;
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error
            throw new HttpException(status.InternalServerError, messages[language].General.errorCreating.replace("##", messages[language].User.user))
        }
    }


    // for delete user, check AssignedProject if exist then give error
    public async deleteUser(ids: string[], createdBy: string, language: string) {
        try {
            const users = await User.find({
                _id: { $in: ids },
                createdBy,
                isDeleted: false,
            }).populate('roleId');

            if (!users.length) {
                throw new HttpException(
                    status.NotFound,
                    messages[language].General.not_found.replace("##", messages[language].User.user)
                );
            }

            await Promise.all(users.map(async (user) => {
                const roleName = (user.roleId as any).name;

                if (roleName === 'Project Manager') {
                    const manager = await ProjectManager.findOne({ userId: user._id, isDeleted: false });
                    if (manager) {
                        if (manager.assignedProjects.length > 0) {
                            throw new HttpException(
                                status.BadRequest,
                                messages[language].User.userDelete.replace("##", `${user.firstName}`));
                        }
                        await ProjectManager.updateOne(
                            { userId: user._id },
                            { $set: { isDeleted: true, deletedAt: new Date(), status: 'Deactivated' } }
                        );
                    }
                } else {
                    const teamMember = await TeamMember.findOne({ userId: user._id, isDeleted: false });
                    if (teamMember) {
                        if (teamMember.assignedProjects.length > 0) {
                            throw new HttpException(
                                status.BadRequest,
                                messages[language].User.userDelete.replace("##", `${user.firstName}`));

                        }
                        await TeamMember.updateOne(
                            { userId: user._id },
                            { $set: { isDeleted: true, deletedAt: new Date(), status: 'Inactive' } }
                        );
                    }
                }
            }));



            // Soft-delete eligible users
            const result = await User.updateMany(
                { _id: { $in: ids }, createdBy, isDeleted: false },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        isActive: false,
                        token: null,
                        tokenExpiry: null,
                        forgotPassword: null,
                        forgotpasswordTokenExpiry: null,
                    },
                }
            );

            if (result.modifiedCount === 0) {
                throw new HttpException(
                    status.NotFound,
                    messages[language].General.not_found.replace("##", messages[language].User.user)
                );
            }

            return { deletedCount: result.modifiedCount };
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, messages[language].errorDeleting.replace("##", messages[language].User.user));
        }
    }




}