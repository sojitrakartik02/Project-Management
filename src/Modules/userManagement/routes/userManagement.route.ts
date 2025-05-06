import { Routes } from "@interface/routes.interface";
import { Router } from "express";
import { userManagementController } from '@userManagement/controllers/userManagement.controller';
import { isAdmin, isuserCreatePermission } from "@middlewares/authMiddleware";


export class userManagementRoutes implements Routes {
    public path = '/user'
    public router = Router()
    public userController = new userManagementController()
    constructor() {
        this.initializeRoutes()
    }
    public initializeRoutes() {
        this.router.post(`${this.path}/create`, isuserCreatePermission, this.userController.createUser)
        this.router.delete(`${this.path}`)
    }
}