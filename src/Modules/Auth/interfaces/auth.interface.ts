import { Document, FlattenMaps, Types } from "mongoose";

export interface IUser {
    _id?: string
    email: string;
    roleId: Types.ObjectId | FlattenMaps<{ name: string }>;

    // roleId: Types.ObjectId;
    isActive: boolean;
    failedLoginAttempts: number;
    lockUntil?: Date;
    lastPasswordChange: Date;
    token?: string;
    tokenExpiry?: Date
    fullName?: string;
    otp?: string;
    otpExpiresAt?: Date;
    otpCreatedAt?: Date;
    isVerifiedOtp?: boolean;
    isVerifyOtpAt?: Date;
    failedOtpAttempts?: number;

    joiningDate?: Date;
    isDeleted?: boolean;
    deletedAt?: Date;


    createdBy?: Types.ObjectId;
    notificationPreferences?: ('email' | 'sms' | 'inApp')[];
    permissions?: string[];
    restrictedPermissions?: string[];


    forgotPassword?: string;
    forgotpasswordTokenExpiry?: Date;
    isFirstTimeResetPassword?: boolean;
    isPasswordUpdate?: boolean;
    passwordUpdatedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
    passwordExpiryDate: Date
    accountSetting: {
        userName?: string;
        passwordHash?: string;
        lastLogin?: Date;
    };

    sessionId: string
    refreshToken: string
    refreshTokenExpiry: Date
    isRememberMe: boolean


    inviteStatus?: 'WaitingToAccept' | 'Active' | 'Deactivated'
    invitedAt: Date
    acceptedInviteAt: Date
    firstName?: string
    lastName?: string
}


export interface DataStoredInToken {
    _id: string;
    role: string;
    email: string;
    passwordHash: string;
    sessionId: string;

}


export interface TokenData {
    token: string;
    expiresIn: string;
}

export interface IUserWithRoleName extends Omit<IUser, 'roleId'> {
    roleId: {
        name: string;
    };
}




export interface IUserResponse extends Document {
    email: string
    fullName: string
    roleName: string
    token: string
    isActive?: boolean
    notificationPreferences?: ('email' | 'sms' | 'inApp')[]
    joiningDate?: Date
    accountSetting?: {
        userName?: string;
        passwordHash?: string;
        lastLogin?: Date;
    };

}