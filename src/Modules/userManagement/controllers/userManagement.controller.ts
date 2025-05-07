import Container from "typedi";
import { userManagementService } from '@userManagement/services/userManagement.services';
import { NextFunction, Request, Response } from "express";
import { pick, removenull } from "@helpers/utilities.services";
import { jsonStatus, messages, status } from "@helpers/api.responses";
import { HttpException } from "@exceptions/httpException";

export class userManagementController {
    public userMService = Container.get(userManagementService)

    //only admin can create ProjectManager and projectManager can create User's (not admin or porjectManager) and PM receive invite email
    public createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const language = req.userLanguage ?? 'en'
            const createdBy = req.user._id
            const userData = pick(req.body, [
                "email",
                "firstName",
                "lastName",
                "roleId"

            ])
            removenull(userData)



            const result = await this.userMService.createUser(userData, createdBy, language)
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].General.add_success.replace("##", messages[language].User.user),
                data: result,
            });

        } catch (error) {
            next(error)
        }
    }

    // admin can delete projectManager only if they are not added to any project
    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const language = req.userLanguage ?? 'en'
            const createdBy = req.user._id
            console.log("createdBy", createdBy)
            const { roleId } = req.body

            if (!roleId.length) {
                throw new HttpException(
                    status.BadRequest,
                    messages[language].General.invalid.replace("##", messages[language].User.Ids)
                );
            }
            const result = await this.userMService.deleteUser(roleId, createdBy, language)
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].General.delete_success.replace("##", messages[language].User.user),
                data: result,
            });

        } catch (error) {
            console.log(error)
            next(error)
        }
    }



    // admin can update any user profile projectManager can update their user's 
    public updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const requesterId = req.user._id;
            const requesterRoleId = req.user.roleId.toString();
            const data = pick(req.body, ["firstName", "lastName", "fullName"]);
            removenull(data);

            const language = req.userLanguage ?? 'en';
            const user = await this.userMService.updateUser(req.params.id, requesterId, requesterRoleId, data, language);

            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].General.update_success.replace("##", messages[language].User.user),
                data: user,
            });
        } catch (error) {
            next(error);
        }
    };



    public getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        const language = req.userLanguage ?? 'en';
        try {
            const userId = req.user._id;
            const {
                page = 1,
                limit = 50,
                search = "",
                role = "",
                sortBy = "firstName",
                sortOrder = "asc",
            } = req.query;

            const result = await this.userMService.getAllUsers(
                userId,
                parseInt(page as string),
                parseInt(limit as string),
                search as string,
                role as string,
                sortBy as string,
                sortOrder as string,
                language
            );

            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].General.get_success.replace("##", messages[language].User.user),
                data: result.users,
                total: result.total,
                page: result.page,
                totalPage: result.totalPage,
            });
        } catch (error) {
            next(error);
        }
    }





}