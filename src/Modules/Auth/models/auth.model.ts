import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "@Auth/interfaces/auth.interface";
import { parseDurationToMs } from "@helpers/utilities.services";
import { PASSWORD_EXPIRY } from "@config/index";

const ObjectId = Schema.Types.ObjectId
const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        },

        roleId: {
            type: ObjectId,
            required: true,
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
                // default: function () {
                //     return generateUniqueUserName(this.email)
                // },
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
        notificationPreferences: {
            type: [String],
            enum: ['email', 'sms', 'inApp'],
            default: ['email', 'inApp'],
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
        isRememberMe: { type: Boolean, default: false }

    },
    { timestamps: true, versionKey: false }
);


const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User
