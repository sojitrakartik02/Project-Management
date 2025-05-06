import mongoose, { Schema, Model } from 'mongoose';
import { IProjectManager } from '../interfaces/projectManager.interface';

const ObjectId = Schema.Types.ObjectId;
export const AssignedProjectSchema = new Schema({
    project: {
        type: ObjectId,
        ref: 'Project',
        required: true,
    },
    assignedAt: {
        type: Date,
        default: Date.now,
    }
}, { _id: false });


const projectManagerSchema = new Schema<IProjectManager>(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        assignedProjects: [AssignedProjectSchema],
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

const ProjectManager: Model<IProjectManager> = mongoose.model<IProjectManager>('ProjectManager', projectManagerSchema);

export default ProjectManager;
