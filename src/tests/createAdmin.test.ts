import { App } from '../app';
import { AuthRoute } from '../Modules/Auth/routes/auth.route';
import User from '../Modules/Auth/models/auth.model';
import Role from '../Modules/Role/models/role.model';
import { connectDatabase } from '../database/index';
import mongoose from 'mongoose';
import { hashPassword } from '../utils/helpers/utilities.services';
import { InviteStatusEnum, StatusEnum } from '@Auth/interfaces/auth.interface';


describe('User Authentication Tests', () => {
    let app: App;

    beforeAll(async () => {
        await connectDatabase();
        app = new App([new AuthRoute()]);

    }, 10000);

    afterAll(async () => {

        await new Promise(resolve => app.httpServer.close(resolve));
        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
        }
    }, 10000);

    it('should login a user, update their own role to admin, and verify', async () => {



        const pmcRole = await Role.findOne({ name: 'Admin' })
        const passwordHash = await hashPassword('SachinNinjatech@123');

        const AdminIser = new User({
            email: `sachin@ninjatechnolabs.com`,
            fullName: `Sachin`,

            joiningDate: new Date(),
            isActive: true,
            roleId: pmcRole._id,
            firstName: 'Sachin',
            lastName: "Ninja",
            inviteStatus: InviteStatusEnum.ACCEPTED,
            invitedAt: new Date(),
            acceptedInviteAt: new Date(),
            isDeleted: false,
            deletedAt: null,

            status:StatusEnum.ACTIVE,
            accountSetting: {

                passwordHash: passwordHash,
                userName: "sachichNinja"

            }


        });

        await AdminIser.save();







    }, 10000);
});