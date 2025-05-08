
import { jsonStatus, messages, status } from "@helpers/api.responses";
import { IProject } from "@Project/interfaces/project.interface";
import { ProjectService } from "@Project/services/project.service";
import { Request, Response, NextFunction } from "express";
import Container from "typedi";

export class ProjectController {
    public projectService = Container.get(ProjectService)
    public createProject = async (req: Request, res: Response, next: NextFunction) => {
        const language = req.userLanguage ?? 'en';
        try {
            const createdBy = req.user._id;

            const projectData: IProject = req.body;
            const result = await this.projectService.createProject(projectData, createdBy, language);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].General.add_success.replace('##', messages[language].Project.project),
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };



}


