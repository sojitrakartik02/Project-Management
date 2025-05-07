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
                User.findOne({ email: data.email }).lean(), // Removed isDeleted filter
                Role.findById(data.roleId.toString()).lean()
            ]);

            if (existingUser?.isDeleted === true) {
                const resetTokenResult = createJWT(existingUser, parseDurationToMs(TOKEN_EXPIRY));
                const resetToken =
                    typeof resetTokenResult === "string"
                        ? resetTokenResult
                        : resetTokenResult.accessToken;
                const resetTokenExpiry = new Date(Date.now() + parseDurationToMs(TOKEN_EXPIRY));

                await User.updateOne(
                    { email: data.email },
                    {
                        $set: {
                            isDeleted: false,
                            isActive: true,
                            deletedAt: null,
                            createdAt: Date.now(),
                            passwordUpdatedAt: null,
                            forgotPassword: resetToken,
                            forgotpasswordTokenExpiry: resetTokenExpiry,
                            isFirstTimeResetPassword: true,
                            isVerifiedOtp: true,
                            isVerifyOtpAt: new Date(),
                            createdBy: createdBy,
                            firstName: data.firstName,
                            lastName: data.lastName
                        },
                        $unset: {
                            token: "",
                            tokenExpiry: "",
                            refreshToken: "",
                            refreshTokenExpiry: "",
                            sessionId: "",
                        }
                    }
                );

                const reactivatedUser = await User.findOne({ email: data.email }).select("_id email firstName lastName roleId isActive isDeleted joiningDate accountSetting.userName"
                ).lean();
                const fName = reactivatedUser.firstName + (reactivatedUser.lastName ?? "");
                const resetLink = `${FRONTEND_URL}/auth/reset-password/change?token=${resetToken}`;
                await resetPasswordEmail(reactivatedUser.email, resetLink, fName);

                return reactivatedUser;
            }

            if (existingUser) {
                throw new HttpException(status.ResourceExist, messages[language].General.already_exist.replace("##", messages[language].User.email));
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
                accountSetting: { passwordHash: hashedPassword },
                isActive: true,
                isDeleted: false,
                joiningDate: new Date(),
                invitedAt: new Date(),
                createdBy: createdBy.toString(),
                inviteStatus: 'WaitingToAccept',
            });

            const resetTokenResult = createJWT(newUser, parseDurationToMs(TOKEN_EXPIRY));
            const resetToken =
                typeof resetTokenResult === "string"
                    ? resetTokenResult
                    : resetTokenResult.accessToken;
            const resetTokenExpiry = new Date(Date.now() + parseDurationToMs(TOKEN_EXPIRY));

            newUser.forgotPassword = resetToken;
            newUser.forgotpasswordTokenExpiry = resetTokenExpiry;
            newUser.isFirstTimeResetPassword = true;
            newUser.isVerifiedOtp = true;
            newUser.isVerifyOtpAt = new Date();

            await newUser.save();

            const userData = await User.findById(newUser._id).select("_id email firstName lastName roleId isActive isDeleted joiningDate accountSetting.userName"
            ).lean();

            if (role.name === "Project Manager") {
                await ProjectManager.create({ userId: newUser._id });
                const fName = data.firstName + (data.lastName ?? "");
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
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                status.InternalServerError,
                messages[language].General.errorCreating.replace("##", messages[language].User.user)
            );
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

                //  Check if user is assigned in any project (as manager or team member)
                // const isAssignedAsManager = await Project.exists({ assignedProjectManager: user._id });
                // const isAssignedAsTeamMember = await Project.exists({ assignedTeamMembers: user._id });

                // if (isAssignedAsManager || isAssignedAsTeamMember) {
                //     throw new HttpException(
                //         status.BadRequest,
                //         messages[language].User.userDelete.replace("##", `${user.firstName}`)
                //     );
                // }

                // Handle soft-delete for ProjectManager
                if (roleName === 'Project Manager') {
                    await ProjectManager.updateOne(
                        { userId: user._id },
                        { $set: { isDeleted: true, deletedAt: new Date(), status: 'Deactivated' } }
                    );
                } else {
                    // Handle soft-delete for TeamMember
                    await TeamMember.updateOne(
                        { userId: user._id },
                        { $set: { isDeleted: true, deletedAt: new Date(), status: 'Inactive' } }
                    );
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



    // profile update

    public async updateUser(id: string, createdBy: string, requesterRoleId: string, data: any, language: string) {
        try {
            const [requesterUser, targetUser, roles] = await Promise.all([
                User.findById(createdBy),
                User.findOne({ _id: id, createdBy: createdBy }),
                Role.find({})
            ]);

            if (!targetUser) {
                throw new HttpException(
                    status.NotFound,
                    messages[language].General.not_found.replace("##", messages[language].User.user)
                );
            }

            const getRoleName = (roleId: string) => roles.find(r => r._id.toString() === roleId)?.name;

            const requesterRole = getRoleName(requesterRoleId);
            const targetRole = getRoleName(targetUser.roleId.toString());

            if (!requesterRole || !targetRole) {
                throw new HttpException(
                    status.Forbidden,
                    messages[language].General.permission
                );
            }

            const isSelf = createdBy === id;

            //  Access Control
            if (requesterRole === "Admin") {
                if (targetRole === "Project Manager" && targetUser.createdBy?.toString() !== createdBy) {
                    throw new HttpException(status.Forbidden, messages[language].General.permission);
                }
            } else if (requesterRole === "Project Manager") {
                if (targetRole === "Admin" || targetRole === "Project Manager") {
                    throw new HttpException(status.Forbidden, messages[language].General.permission);
                }
            } else if (teamMemberRoles.includes(requesterRole)) {
                if (!isSelf) {
                    throw new HttpException(status.Forbidden, messages[language].General.permission);
                }
            } else {
                throw new HttpException(status.Forbidden, messages[language].General.permission);
            }

            //  Update Only Changed Fields
            const updatedFields: any = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key) && targetUser.get(key) !== data[key]) {
                    updatedFields[key] = data[key];
                }
            }

            if (Object.keys(updatedFields).length > 0) {
                await User.findByIdAndUpdate(id, updatedFields, { runValidators: true });
            }

            return await User.findById(id).select(
                "_id firstName lastName fullName email roleId isActive notificationPreferences accountSetting.userName createdAt updatedAt"
            );
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;

            throw new HttpException(
                status.InternalServerError,
                messages[language].General.errorUpdating.replace("##", messages[language].User.user)
            );
        }
    }


    public async getAllUsers(
        userId: string,
        page: number,
        limit: number,
        search: string,
        roleFilter: string,
        sortBy: string,
        sortOrder: string,
        language: string
    ): Promise<any> {
        try {
            const currentUser = await User.findById(userId).lean();
            if (!currentUser) throw new HttpException(status.BadRequest, "User not found");

            const currentRole = await Role.findById(currentUser.roleId).lean();
            if (!currentRole) throw new HttpException(status.BadRequest, "Role not found");

            if (!["Admin", "Project Manager"].includes(currentRole.name)) {
                throw new HttpException(status.Forbidden, "You do not have permission to view users");
            }

            const skip = (page - 1) * limit;
            const nameRegex = new RegExp(search.trim(), 'i');
            const roleRegex = roleFilter ? new RegExp(roleFilter.trim(), 'i') : null;

            // Base filter (name, userName, etc.)
            const baseFilter: any = {
                isDeleted: false,
                $or: [
                    { firstName: nameRegex },
                    { lastName: nameRegex },
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: ['$firstName', ' ', '$lastName'] },
                                regex: nameRegex
                            }
                        }
                    },
                    { 'accountSetting.userName': nameRegex }
                ]
            };

            // if (currentRole.name === "Project Manager") {
            //     const projectsManaged = await Project.find({ assignedProjectManager: currentUser._id })
            //         .select("assignedTeamMembers")
            //         .lean();

            //     if (!projectsManaged.length) return { users: [], total: 0 };

            //     const assignedUserIds = new Set<string>();
            //     projectsManaged.forEach(project => {
            //         project.assignedTeamMembers?.forEach((id: any) => assignedUserIds.add(id.toString()));
            //     });

            //     baseFilter._id = { $in: Array.from(assignedUserIds) };
            // }


            // Full aggregation with role name filter
            const pipeline: any[] = [
                { $match: baseFilter },
                {
                    $lookup: {
                        from: "roles",
                        localField: "roleId",
                        foreignField: "_id",
                        as: "role"
                    }
                },
                { $unwind: "$role" },
                { $match: { "role.name": { $ne: "Admin" } } },

            ];

            if (roleRegex) {
                pipeline.push({
                    $match: { "role.name": { $regex: roleRegex } }
                });
            }

            pipeline.push(
                {
                    $addFields: {
                        roleName: "$role.name"
                    }
                },
                {
                    $sort: {
                        ...(sortBy === "roleName"
                            ? { roleName: sortOrder === "desc" ? -1 : 1, firstName: 1 }
                            : { firstName: sortOrder === "desc" ? -1 : 1 })
                    }
                },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        email: 1,
                        firstName: 1,
                        lastName: 1,
                        roleId: 1,
                        roleName: 1,
                        isActive: 1,
                        joiningDate: 1,
                        "accountSetting.userName": 1
                    }
                }
            );

            const countPipeline = [
                ...pipeline.slice(0, pipeline.findIndex(p => '$sort' in p || '$skip' in p || '$limit' in p)),
                { $count: "total" }
            ];

            const [users, totalResult] = await Promise.all([
                User.aggregate(pipeline),
                User.aggregate(countPipeline)
            ]);

            const total = totalResult[0]?.total || 0;

            return {
                users,
                total,
                page,
                totalPage: Math.ceil(total / limit)
            };

        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                status.InternalServerError,
                messages[language].General.errorFetching.replace("##", messages[language].User.user)
            );
        }
    }


}









