
import { jsonStatus, messages, status } from "@helpers/api.responses";
import { sanitiseString } from "@helpers/utilities.services";
import { QueryProjectsDto } from "@Project/dtos/project.dto";
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

    public getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
        const language = req.userLanguage ?? 'en';
        try {
            const {
                page = 1,
                limit = 50,
                search = "",
                sortBy = 'name',
                sortOrder = 'asc',
                ...filters
            } = req.query;

            const createdBy = req.user._id
            const roleId = req.user.roleId.toString()
            const pageNumber = parseInt(page as string, 10);
            const pageLimit = parseInt(limit as string, 10);


            const sortDirection = sortOrder === 'desc' ? -1 : 1;
            const sortOptions = { [sortBy as string]: sortDirection };

            const queryFilter: any = { isDeleted: false };

            if (search) {
                const sanitizedSearch = sanitiseString(search as string);

                queryFilter.$or = [
                    { name: new RegExp(sanitizedSearch, 'i') }]
            }

            for (const [key, value] of Object.entries(filters)) {
                if (value && typeof value === 'string') {
                    const val = sanitiseString(value);
                    if (val.trim()) {
                        queryFilter[key] = new RegExp(val, 'i');
                    }
                }
            }

            const result = await this.projectService.getAll(createdBy, roleId, queryFilter, pageNumber, pageLimit, sortOptions, language);

            return res.status(status.OK).json({
                jsonStatus: jsonStatus.OK,
                message: messages[language].General.get_all_success.replace('##', messages[language].Project.projects),
                ...result,
            });
        } catch (error) {

            next(error);
        }
    }


    public getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const createdBy = req.user._id
            const roleId = req.user.roleId.toString()
            const language = req.userLanguage ?? 'en'
            const result = await this.projectService.getById(id, createdBy,roleId, language)
            return res.status(status.OK).json({
                jsonStatus: jsonStatus.OK,
                message: messages[language].General.get_success.replace("##", messages[language].Project.project),
                result
            })
        } catch (error) {
            next(error)
        }
    }





}


