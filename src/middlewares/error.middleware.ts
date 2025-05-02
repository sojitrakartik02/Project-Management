import { HttpException } from "../utils/exceptions/httpException";
import { Request, Response, NextFunction } from 'express'
export const ErrorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
    try {
        const status: number = error.status || 400;
        const message: string = error.message || 'Something Went Wrong';
        return res.status(status).json({
            status: status,
            message: message
        })
    } catch (err) {
        console.error(error);
        next(err)
    }
}


