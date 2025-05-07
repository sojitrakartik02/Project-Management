import { Routes } from "@interface/routes.interface";
import { ProjectController } from "@Project/controllers/project.controller";
import { Router } from 'express';

export class ProjectRoutes implements Routes {
    public path = '/project'
    public projectController = new ProjectController()
    public router = Router()

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes() {

    }
}