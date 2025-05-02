import { RoleService } from "../services/role.service";
import { Request, Response, NextFunction } from "express";
import Container from "typedi";
import { jsonStatus, messages, status } from "../../../utils/helpers/api.responses";
// import { sanitiseString } from "../../../utils/helpers/utilities.services";

export class RoleController {
    public roleService = Container.get(RoleService);

    public create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, description } = req.body;
            const newRole = await this.roleService.createRole(name, description);
            res.status(201).json({ message: "Role created successfully", data: newRole });
        } catch (err) {
            next(err);
        }
    };

    public getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page = 1, limit = 50, search = "", sortBy = 'name', sortOrder, } = req.query;


            const pageNumber = parseInt(page as string, 10);
            const pageLimit = parseInt(limit as string, 10);
            const sortDirection = sortOrder === 'desc' ? -1 : 1


            const filters: any = { isActive: true, name: { $ne: "Admin" } };



            if (search) {
                // const sanitizedSearch = sanitiseString(search as string);
                filters.name = new RegExp(search  as string, 'i');
            }

            const sortOptions = { [sortBy as string]: sortDirection };

            const result = await this.roleService.getAllRoles(filters, pageNumber, pageLimit, sortOptions);


            res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[req.userLanguage ?? 'English'].General.get_all_success.replace("##", messages[req.userLanguage ?? 'English'].Role.role),
                ...result
            });
        } catch (err) {
            next(err);
        }
    };

    public getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const language = req.userLanguage ?? 'English'
            const role = await this.roleService.getRoleById(id);
            if (!role) {
                res.status(status.NotFound).json({
                    status: jsonStatus.NotFound,
                    message: messages[language].General.invalid.replace("##", messages[language].User.Ids)
                });
            } else {
                res.status(status.OK).json({
                    status: jsonStatus.OK,
                    message: messages[language].General.get_success.replace("##", messages[language].Role.role),
                    data: role
                });
            }
        } catch (err) {
            next(err);
        }
    };

    public updateRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const updates = req.body;
            const updatedRole = await this.roleService.updateRole(id, updates);
            if (!updatedRole) {
                res.status(404).json({ message: "Role not found" });
            } else {
                res.status(200).json({ message: "Role updated successfully", data: updatedRole });
            }
        } catch (err) {
            next(err);
        }
    };

    public deleteRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const deletedRole = await this.roleService.deleteRole(id);
            if (!deletedRole) {
                res.status(404).json({ message: "Role not found" });
            } else {
                res.status(200).json({ message: "Role deleted successfully" });
            }
        } catch (err) {
            next(err);
        }
    };
}