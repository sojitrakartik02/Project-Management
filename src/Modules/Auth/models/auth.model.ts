import mongoose, { Model, Schema } from "mongoose";
import { InviteStatusEnum, IUser, NotificationPreferenceEnum, StatusEnum } from "@Auth/interfaces/auth.interface";
import { parseDurationToMs } from "@helpers/utilities.services";
import { PASSWORD_EXPIRY } from "@config/index";

const ObjectId = Schema.Types.ObjectId
const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,

            lowercase: true,
            match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        },

        roleId: {
            type: ObjectId,
            required: true,
            ref: 'Role'
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        failedLoginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
            default: null
        },

        fullName: { type: String },

        passwordExpiryDate: {
            type: Date,
            default: () => new Date(Date.now() + parseDurationToMs(PASSWORD_EXPIRY))
        },
        accountSetting: {
            userName: {
                type: String,
                required: false
            },
            passwordHash: { type: String, required: true, minLength: 12 },
            lastLogin: { type: Date, required: false },
        },

        joiningDate: { type: Date, default: Date.now },
        isVerifiedOtp: { type: Boolean, default: null },
        isVerifyOtpAt: { type: Date, default: null },
        isPasswordUpdate: { type: Boolean, default: false },
        passwordUpdatedAt: { type: Date, required: false },
        otp: { type: String, required: false },
        otpCreatedAt: { type: Date, required: false },
        otpExpiresAt: { type: Date, required: false },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, required: false },
        token: { type: String, required: false },
        createdBy: {
            type: ObjectId,
            ref: 'User',

        },
        inviteStatus: {
            type: String,
            enum: Object.values(InviteStatusEnum),
            default: InviteStatusEnum.WAITING_TO_ACCEPT
        },
        invitedAt: { type: Date },
        acceptedInviteAt: { type: Date },

        firstName: { type: String },
        lastName: { type: String },




        notificationPreferences: {
            type: [String],
            enum: Object.values(NotificationPreferenceEnum),
            default: [NotificationPreferenceEnum.EMAIL, NotificationPreferenceEnum.IN_APP],
        },

        permissions: [{ type: String, default: [] }],
        restrictedPermissions: [{ type: String, default: [] }],
        forgotPassword: { type: String, required: false, default: null },
        forgotpasswordTokenExpiry: { type: Date, required: false, default: null },
        tokenExpiry: { type: Date, required: false },
        isFirstTimeResetPassword: { type: Boolean, default: null, required: false },
        sessionId: { type: String, required: false },

        refreshToken: { type: String, required: false },
        refreshTokenExpiry: { type: Date, required: false },
        isRememberMe: { type: Boolean, default: false },
        status: {
            type: String,
            enum: Object.values(StatusEnum),
            default: StatusEnum.ACTIVE
        },


    },
    { timestamps: true, versionKey: false }
);
userSchema.pre('save', async function (next) {
    try {
        const user = this as IUser
        if (!user.accountSetting.userName) {
            user.accountSetting ??= {}
            user.accountSetting.userName ??= await generateUniqueUserName(user.email)
        }


        next()
    } catch (error) {
        next(error)
    }
})


async function generateUniqueUserName(email: string): Promise<string> {
    let baseUserName = email.split("@")[0];
    let userName = baseUserName;
    let counter = 1;

    while (await mongoose.model("User").exists({ userName })) {
        userName = `${baseUserName}${counter}`;
        counter++;
    }

    return userName;
}

userSchema.index({ email: 1, createdBy: 1 }, { unique: true })
userSchema.index({ createdBy: 1 })

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User
