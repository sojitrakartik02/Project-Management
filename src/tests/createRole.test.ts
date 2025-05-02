import { connectDatabase } from "../database/index";
import { App } from "../app"
import RoleData from '../utils/Role.json'
import Role from "../Modules/Role/models/role.model";
import Permission from "../Modules/Permission/models/Permission.model";
import mongoose from "mongoose";
import { RoleRoute } from "../Modules/Role/routes/role.route";




describe('Create Roles and permission', () => {
    let app: App;

    beforeAll(async () => {
        app = new App([new RoleRoute()]);
        await connectDatabase();

        for (const rolesData of RoleData.roles) {
            let role = await Role.findOne({ name: rolesData.name });
            if (!role) {
                const permissionIds = await Promise.all(
                    rolesData.permissions.map(async (permName) => {
                        let permission = await Permission.findOne({ name: permName });
                        if (!permission) {
                            permission = new Permission({
                                name: permName,
                                description: `${permName} permission`,
                                isActive: true
                            });
                            await permission.save();
                        }
                        return permission._id;
                    })
                );
                role = new Role({ name: rolesData.name, permissions: permissionIds, isActive: true });
                await role.save();
            }
        }
    }, 15000); // increased timeout

    afterAll(async () => {
        await new Promise(resolve => app.httpServer.close(resolve));
        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
        }
    });

    it('should create roles and permissions without errors', async () => {
        const roles = await Role.find({});
        expect(roles.length).toBeGreaterThan(0);
    });
});
