import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
// import { isAdmin } from '../../../middlewares/authMiddleware';



/**
 * @swagger
 * tags:
 *  name: Role
 *  description: Role API
 */

export class RoleRoute {
    public router = Router();
    public roleController = new RoleController();
    public path = '/role';

    constructor() {

        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${this.path}`, this.roleController.create);
        this.router.get(`${this.path}`, this.roleController.getAllRoles);
        this.router.get(`${this.path}/:id`, this.roleController.getById);
        this.router.put(`${this.path}/:id`, this.roleController.updateRole);
        this.router.delete(`${this.path}/:id`, this.roleController.deleteRole);
    }
}