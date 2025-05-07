import { Routes } from "@interface/routes.interface";
import { Router } from "express";
import { userManagementController } from '@userManagement/controllers/userManagement.controller';
import { authMiddleware, isAdmin, isuserCreatePermission, isUserPermissionArray } from "@middlewares/authMiddleware";


export class userManagementRoutes implements Routes {
    public path = '/user'
    public router = Router()
    public userController = new userManagementController()
    constructor() {
        this.initializeRoutes()
    }
    public initializeRoutes() {
        this.router.post(`${this.path}/create`, isuserCreatePermission, this.userController.createUser)
        this.router.delete(`${this.path}`, isUserPermissionArray, this.userController.deleteUser)
        this.router.put(`${this.path}/:id`, authMiddleware, this.userController.updateUser)

        this.router.get(`${this.path}`,authMiddleware, this.userController.getAllUsers)
    }
}