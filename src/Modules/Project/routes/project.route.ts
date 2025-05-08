import { Routes } from "@interface/routes.interface";
import { isAdmin, isAdminorPM, isuserCreatePermission } from "@middlewares/authMiddleware";
import { validationMiddleware } from "@middlewares/validation.middleware";
import { ProjectController } from "@Project/controllers/project.controller";
import { CreateProjectDto } from "@Project/dtos/project.dto";
import { Router } from 'express';

export class ProjectRoutes implements Routes {
    public path = '/project'
    public projectController = new ProjectController()
    public router = Router()

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post(`${this.path}`, isAdminorPM, validationMiddleware(CreateProjectDto), this.projectController.createProject)
        this.router.get(`${this.path}`, isAdminorPM, this.projectController.getAllProjects)
    }
}