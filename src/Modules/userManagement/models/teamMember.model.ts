import { AssignedProjectSchema } from '@ProjectManager/models/projectManager.model';
import { ITeamMember } from '@userManagement/interfaces/teamMember.interface';
import mongoose, { Schema, Model } from 'mongoose';

const ObjectId = Schema.Types.ObjectId
const teamMemberSchema = new Schema<ITeamMember>(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },

        assignedProjects: [AssignedProjectSchema],
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        deletedAt: { type: Date, default: null },
        isDeleted: { type: Boolean, default: true },

    },
    {
        timestamps: true, versionKey: false
    }
);
teamMemberSchema.index({ status: 1 })

const TeamMember: Model<ITeamMember> = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
export default TeamMember;
