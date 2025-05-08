import mongoose, { Schema, Model } from 'mongoose';
import { IClient, IProject, projectStatus } from '@Project/interfaces/project.interface';


const ClientSchema: Schema = new Schema<IClient>({
    name: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    skypeId: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
}, { _id: false });

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
            enum: Object.values(projectStatus),
            default: projectStatus.Not_Started,
        },
        clients: {
            type: [ClientSchema],
            required: true,
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

