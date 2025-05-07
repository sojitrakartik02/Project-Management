import { Document, FlattenMaps, Types } from "mongoose";
import userStatus from '@userManagement/constant/userStatus.json'



export const StatusEnum = {
    ACTIVE: userStatus.statuses[0],
    INACTIVE: userStatus.statuses[1],
    DEACTIVATED: userStatus.statuses[2],
};

export const InviteStatusEnum = {
    WAITING_TO_ACCEPT: userStatus.inviteStatuses[0],
    ACCEPTED: userStatus.inviteStatuses[1],
    DEACTIVATED: userStatus.inviteStatuses[2],
};

export const NotificationPreferenceEnum = {
    EMAIL: userStatus.notificationPreference[0],
    SMS: userStatus.notificationPreference[1],
    IN_APP: userStatus.notificationPreference[2],
};
export const AllowedRolesForPM = userStatus.allowedRolesForPM;


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
    notificationPreferences?: (typeof userStatus.notificationPreference)[number][];
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


    inviteStatus?: (typeof userStatus.inviteStatuses)[number]
    invitedAt: Date
    acceptedInviteAt: Date
    firstName?: string
    lastName?: string
    status?: (typeof userStatus.statuses)[number]
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
    notificationPreferences?: (typeof userStatus.notificationPreference)[number][]
    joiningDate?: Date
    accountSetting?: {
        userName?: string;
        passwordHash?: string;
        lastLogin?: Date;
    };
    // status?: (typeof StatusEnum)[keyof typeof StatusEnum];
    status: (typeof userStatus.statuses)[number]
}