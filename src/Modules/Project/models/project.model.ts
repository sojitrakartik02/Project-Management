import mongoose, { Schema, Model } from 'mongoose';
import { IProject } from '@Project/interfaces/project.interface';


const ObjectId = Schema.Types.ObjectId

const ProjectSchema: Schema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
            default: 'Not Started',
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        assignedProjectManager: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        assignedTeamMembers: [
            {
                type: ObjectId,
                ref: 'User',
            },
        ],
        createdBy: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true, versionKey: false
    }
);

ProjectSchema.index({ name: 1 })


const Project: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);
export default Project