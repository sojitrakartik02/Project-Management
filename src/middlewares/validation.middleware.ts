import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/exceptions/httpException';
import { status } from '../utils/helpers/api.responses';

export const validationMiddleware = (type: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body.language = req.userLanguage ?? 'en';
            const dtoObj = plainToInstance(type, req.body, { enableImplicitConversion: true });
            const errors: ValidationError[] = await validate(dtoObj);
            if (errors.length > 0) {
                function extractMessages(errors: ValidationError[]): string[] {
                    return errors.flatMap(error => {
                        const constraints = Object.values(error.constraints || {});
                        const childMessages = error.children ? extractMessages(error.children) : [];
                        return [...constraints, ...childMessages];
                    });
                }

                const message = extractMessages(errors).join(', ');

                throw new HttpException(status.BadRequest, message);
            }

            req.body = dtoObj;
            next();
        } catch (error) {
          
            next(error);
        }
    };
};