import mongoose, { Schema, Model } from 'mongoose';
import { IProjectManager } from '../interfaces/projectManager.interface';

const ObjectId = Schema.Types.ObjectId;


const projectManagerSchema = new Schema<IProjectManager>(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Deactivated'],
            default: 'Active'
        },
        deletedAt: { type: Date, default: null },
        isDeleted: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false }
);

projectManagerSchema.index({ status: 1 })


const ProjectManager: Model<IProjectManager> = mongoose.model<IProjectManager>('ProjectManager', projectManagerSchema);

export default ProjectManager;
