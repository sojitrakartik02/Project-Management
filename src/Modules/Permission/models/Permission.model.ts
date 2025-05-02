import { IPermission } from "../interfaces/Permission.interface";
import mongoose, { Model, Schema } from "mongoose";

const PermissionSchema = new Schema<IPermission>({
    name: { type: String },
    description: { type: String },
    module: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false })

const Permission: Model<IPermission> = mongoose.model<IPermission>('Permissions', PermissionSchema)
export default Permission
