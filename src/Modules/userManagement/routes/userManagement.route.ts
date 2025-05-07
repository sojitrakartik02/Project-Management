import { Routes } from "@interface/routes.interface";
import { Router } from "express";
import { userManagementController } from '@userManagement/controllers/userManagement.controller';
import { authMiddleware, isuserCreatePermission, isUserPermissionArray } from "@middlewares/authMiddleware";

/**
 * @swagger
 * tags:
 *   name: User Management
 *   description: User Management APIs
 */

export class userManagementRoutes implements Routes {
    public path = '/user'
    public router = Router()
    public userController = new userManagementController()
    constructor() {
        this.initializeRoutes()
    }
    public initializeRoutes() {
        this.router.post(`${this.path}`, isuserCreatePermission, this.userController.createUser)
        this.router.delete(`${this.path}`, isUserPermissionArray, this.userController.deleteUser)
        this.router.put(`${this.path}/:id`, authMiddleware, this.userController.updateUser)

        this.router.get(`${this.path}`, authMiddleware, this.userController.getAllUsers)
    }
}