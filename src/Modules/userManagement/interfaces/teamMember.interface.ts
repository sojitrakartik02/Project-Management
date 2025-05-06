import { IAssignedProject } from '@ProjectManager/interfaces/projectManager.interface';
import { Types } from 'mongoose';



export interface ITeamMember {
    userId: Types.ObjectId;

    assignedProjects?: IAssignedProject[];
    status?: 'Active' | 'Inactive';
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean
    deletedAt?: Date
}
