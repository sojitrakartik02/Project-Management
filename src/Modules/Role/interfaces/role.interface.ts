import { Document, Types } from "mongoose";

export interface IRole {

    name: string;
    permissions: Types.ObjectId[]
    description?: string;
    dataFieldRestricated: Boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date
    isActive: boolean
}

export interface RoleDocumnet extends Document, IRole { }