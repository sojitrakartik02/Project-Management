import { Document, Types } from 'mongoose';




export interface IProjectManager extends Document {
    userId: Types.ObjectId
    status: 'Active' | 'Deactivated'

    isDeleted?: boolean;
    deletedAt?: Date;

}
