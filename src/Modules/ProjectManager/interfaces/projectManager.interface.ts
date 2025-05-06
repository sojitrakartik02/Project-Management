import { Document, Types } from 'mongoose';

export interface IAssignedProject {
    project: Types.ObjectId;
    assignedAt: Date;
}


export interface IProjectManager extends Document {
    userId: Types.ObjectId
    assignedProjects: IAssignedProject[];
    status: 'Active' | 'Deactivated'

    isDeleted?: boolean;
    deletedAt?: Date;

}
