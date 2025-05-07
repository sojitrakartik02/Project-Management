import { Types } from 'mongoose';



export interface ITeamMember {
    userId: Types.ObjectId;

    status?: 'Active' | 'Inactive';
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean
    deletedAt?: Date
}
