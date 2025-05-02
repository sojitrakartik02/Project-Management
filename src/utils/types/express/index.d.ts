import { IUser } from '@Auth/interfaces/auth.interface';
import 'express';

declare module 'express-serve-static-core' {
    interface Request {
        user?: IUser
        userLanguage?: string;
    }
}
