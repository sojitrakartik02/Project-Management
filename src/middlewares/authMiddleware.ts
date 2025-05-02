import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '@utils/helpers/utilities.services';
import User from '@Auth/models/auth.model';
import Role from '../Modules/Role/models/role.model';
import { HttpException } from '../utils/exceptions/httpException';
import { DataStoredInToken } from '@Auth/interfaces/auth.interface';
import { Types } from 'mongoose';
import { IPermission } from '../Modules/Permission/interfaces/Permission.interface';
import Permission from '../Modules/Permission/models/Permission.model';
import { jsonStatus, messages, status } from '../utils/helpers/api.responses';


export const getAuthenticatedUser = async (req: Request) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        throw new HttpException(status.Unauthorized, messages[req.userLanguage].General.empty.replace('##', messages[req.userLanguage].User.token));
    }

    const decoded = verifyJWT(token) as DataStoredInToken;

    if (!decoded) {
        throw new HttpException(status.Unauthorized, messages[req.userLanguage].General.invalid.replace("##", messages[req.userLanguage].User.token));
    }
    const user = await User.findOne({ _id: decoded._id })



    if (user.accountSetting.passwordHash !== decoded.passwordHash) {
        throw new HttpException(status.Unauthorized, messages[req.userLanguage].General.sessionExpired);

    }



    if (!user || !user.isActive) {
        throw new HttpException(status.Unauthorized, messages[req.userLanguage].General.invalid.replace("##", messages[req.userLanguage].User.user));
    }

    const currentTime = Date.now()
    if (user.tokenExpiry && currentTime > user.tokenExpiry.getTime()) {
        throw new HttpException(status.Unauthorized, messages[req.userLanguage].General.expired.replace("##", messages[req.userLanguage].User.token));

    }

    return user;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await getAuthenticatedUser(req)
        req.user = user
        next();
    } catch (error) {
        if (error instanceof HttpException) {
            return res.status(error.status).json({
                status: error.status,
                message: error.message,
            });
        }
        return res.status(status.InternalServerError).json({
            status: status.InternalServerError,
            message: messages[req.userLanguage || 'English'].General.error,
        });
    }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const language = req.userLanguage ?? 'en'
    try {
        const user = await getAuthenticatedUser(req);
        const userRole = user.roleId instanceof Types.ObjectId
            ? await Role.findById(user.roleId.toString())
            : user.roleId;

        if (!userRole || userRole.name !== 'Admin') {
            throw new HttpException(status.Forbidden, messages[language].General.permission);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof HttpException) {
            return res.status(error.status).json({
                status: error.status,
                message: error.message,
            });
        }
        return res.status(status.InternalServerError).json({
            status: status.InternalServerError,
            message: messages[language].General.error,
        });
    }
};



export const restrictToSelfOrAdminCreator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user._id).populate<{
            roleId: { name: string };
        }>('roleId').lean();

        if (!user) {
            throw new HttpException(
                status.Unauthorized,
                messages[req.userLanguage || 'English'].General.unauthorized
            );
        }

        const isAdmin = user.roleId.name === 'Admin';
        const isSelf = req.user._id.toString() === req.params.id;

        if (isAdmin && !isSelf) {
            const targetUser = await User.findOne({
                _id: req.params.id,
                createdBy: req.user._id,
                isDeleted: false,
            }).lean();

            if (!targetUser) {
                throw new HttpException(
                    status.Forbidden,
                    messages[req.userLanguage || 'English'].General.permission
                );
            }
        } else if (!isAdmin && !isSelf) {
            throw new HttpException(
                status.Forbidden,
                messages[req.userLanguage || 'English'].General.permission
            );
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof HttpException) {
            return res.status(error.status).json({
                status: error.status,
                message: error.message,
            });
        }
        return res.status(status.InternalServerError).json({
            status: status.InternalServerError,
            message: messages[req.userLanguage || 'English'].General.error,
        });
    }
};

export const checkPermission = (requiredPermission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await getAuthenticatedUser(req);

            let rolePermissions: string[] = [];
            if (user.roleId) {
                const role = await Role.findById(user.roleId).populate<{ permissions: IPermission[] }>('permissions');
                rolePermissions = role?.permissions?.map((perm) => perm.name) || [];
            }

            const allPermissions = await Permission.find({
                _id: { $in: [...(user.permissions || []), ...(user.restrictedPermissions || [])] }
            });

            const userPermissions = new Set(
                allPermissions
                    .filter((perm) => user.permissions?.includes(perm._id.toString()))
                    .map((perm) => perm.name)
            );

            const restrictedPermissions = new Set(
                allPermissions
                    .filter((perm) => user.restrictedPermissions?.includes(perm._id.toString()))
                    .map((perm) => perm.name)
            );

            // Combine role and user permissions, then remove restricted ones
            const combinedPermissions = new Set([...rolePermissions, ...userPermissions]);
            restrictedPermissions.forEach((perm) => combinedPermissions.delete(perm));

            if (!combinedPermissions.has(requiredPermission)) {
                throw new HttpException(status.Forbidden, messages[req.userLanguage].General.permisssion);
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(status.Forbidden).json({
                status: jsonStatus.Forbidden,
                message: messages[req.userLanguage].General.permisssion,
            });
        }
    };
};


// export const checkPermission = (requiredPermission: string) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const user = await getAuthenticatedUser(req);

//             let rolePermissions: string[] = [];
//             if (user.roleId) {
//                 const role = await Role.findById(user.roleId).populate<{ permissions: IPermission[] }>('permissions');
//                 rolePermissions = role?.permissions.map((perm) => perm.name) || [];
//             }


//             const userPermissionsDocs = await Permission.find({ _id: { $in: user.permissions || [] } });
//             const userPermissions = userPermissionsDocs.map((perm) => perm.name);
//             const restrictedPermissionsDocs = await Permission.find({ _id: { $in: user.restrictedPermissions || [] } });
//             const restrictedPermissions = restrictedPermissionsDocs.map((perm) => perm.name);

//             const combinedPermissions = new Set([...rolePermissions, ...userPermissions]);
//             restrictedPermissions.forEach((perm) => combinedPermissions.delete(perm));

//             if (!combinedPermissions.has(requiredPermission)) {
//                 throw new HttpException(status.Forbidden, messages[req.userLanguage].permisssion);
//             }

//             req.user = user;
//             next();
//         } catch (error) {
//             return next(error);
//         }
//     };
// };
