import Container from "typedi";
import { userManagementService } from '@userManagement/services/userManagement.services';
import { NextFunction, Request, Response } from "express";
import { pick, removenull } from "@helpers/utilities.services";
import { jsonStatus, messages, status } from "@helpers/api.responses";

export class userManagementController {
    public userMService = Container.get(userManagementService)
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


    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const language = req.userLanguage ?? 'en'
            const createdBy = req.user._id
            const ids = req.body

            const result = await this.userMService.createUser(ids, createdBy, language)
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].General.delete_success.replace("##", messages[language].User.user),
                data: result,
            });

        } catch (error) {
            next(error)
        }
    }




}