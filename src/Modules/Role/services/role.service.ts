import Role from "../models/role.model";
import { Service } from "typedi";
import fs from 'fs'
import path from 'path'
import { HttpException } from "../../../utils/exceptions/httpException";

@Service()
export class RoleService {
    public async createRole(name: string, description?: string) {
        const rolesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../utils/role.json'), 'utf-8'))
        const rolePermission = rolesData.roles.find((role: any) => role.name === name)
        if (!rolePermission) {
            throw new HttpException(404, 'This role is not correct')
        }
        const newRole = new Role({ name, description, permissions: rolePermission.permissions });
        await newRole.save();
        return newRole;
    }

    public async getRoleById(id: string) {
        return await Role.findById(id);
    }

    public async updateRole(id: string, updates: any) {
        return await Role.findByIdAndUpdate(id, updates, { new: true });
    }

    public async deleteRole(id: string) {
        return await Role.findByIdAndDelete(id);
    }

    public async getAllRoles(filters: any, page: number, limit: number, sort: any) {
        const skip = (page - 1) * limit;

        const [result, totalCount] = await Promise.all([
            Role.find(filters).sort(sort).skip(skip).limit(limit).select('name _id'),
            Role.countDocuments(filters)
        ]);

        return {
            data: result,
            total: totalCount,
            page,
            totalPage: Math.ceil(totalCount / limit)
        };
    }

}



