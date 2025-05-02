import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/exceptions/httpException';
import { status } from '../utils/helpers/api.responses';

export const validationMiddleware = (type: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body.language = req.userLanguage || 'English';
            const dtoObj = plainToInstance(type, req.body);
            const errors: ValidationError[] = await validate(dtoObj);

            if (errors.length > 0) {
                const message = errors
                    .map((error: ValidationError) => Object.values(error.constraints || {}).join(', '))
                    .join(', ');
                throw new HttpException(status.BadRequest, message);
            }

            req.body = dtoObj;
            next();
        } catch (error) {
            next(error);
        }
    };
};