import { IUser } from "@Auth/interfaces/auth.interface";
import { Document, Types } from "mongoose";
import status from '@Project/constant/projectStatus.json'

export const projectStatus = {
    Not_Started: status.projectStatus[0],
    In_Progress: status.projectStatus[1],
    Completed: status.projectStatus[2],
    On_Hold: status.projectStatus[3],
    Cancelled: status.projectStatus[4]
}

export interface IProject extends Document {
    name: string;
    description?: string;
    status: (typeof status.projectStatus)[number];
    startDate?: Date;
    endDate?: Date;
    assignedProjectManager: Types.ObjectId | IUser;
    assignedTeamMembers: Types.ObjectId[] | IUser[];
    createdBy: Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    deletedAt?: Date;
}