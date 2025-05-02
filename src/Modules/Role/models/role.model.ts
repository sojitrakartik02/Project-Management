import mongoose, { Schema, Model } from 'mongoose';
import { RoleDocumnet } from '../interfaces/role.interface';

const roleSchema = new Schema<RoleDocumnet>({

    name: { type: String, required: true, unique: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permissions' }],
    description: { type: String },
    dataFieldRestricated: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
}, { timestamps: true, versionKey: false });

const Role: Model<RoleDocumnet> = mongoose.model<RoleDocumnet>('Role', roleSchema);


export default Role