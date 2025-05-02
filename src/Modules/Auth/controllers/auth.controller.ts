import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@Auth/services/auth.service'
import Container from 'typedi';
import { status, jsonStatus, messages } from '@utils/helpers/api.responses';
import { pick, removenull, verifyJWT } from '@utils/helpers/utilities.services';
import { HttpException } from '../../../utils/exceptions/httpException';


export class AuthController {
    public authService = Container.get(AuthService);

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['email', 'password', 'rememberMe']);
            removenull(req.body);
            const language = req.userLanguage ?? 'en'
            const { email, password, rememberMe = false } = req.body;


            const { user, token } = await this.authService.login(email.toLowerCase(), password, rememberMe, language);
            return res.status(status.OK).set('Authorization', token).json({
                status: jsonStatus.OK,
                message: messages[language].User.succ_login,
                data: user,
                Authorization: token,
            });
        } catch (error) {
            next(error)
        }
    };

    public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['email']);
            removenull(req.body);

            const { email } = req.body;

            const language = req.userLanguage ?? 'en'
            await this.authService.forgotPassword(email, language);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].User.OTP_sent_succ
            });
        } catch (error) {
            next(error)
        }
    };
    public resendOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {

            req.body = pick(req.body, ['email']);
            removenull(req.body);

            const { email } = req.body;
            const language = req.userLanguage ?? 'en'



            const token = await this.authService.resendOtp(email, language);

            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].User.resentotp,
                Authorization: token,
            });
        } catch (error) {
            next(error);
        }
    };


    public verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['otp', 'email']);
            removenull(req.body);

            const { email, otp } = req.body;
            const language = req.userLanguage ?? 'en'



            await this.authService.verifyOTP(email, otp, language);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].User.verification_success,
            });
        } catch (error) {
            next(error)
        }
    };

    public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['newPassword', 'confirmPassword', 'email', 'token']);
            removenull(req.body);
            const language = req.userLanguage ?? 'en'

            let { newPassword, confirmPassword, email, token } = req.body;

            if (!email && token) {

                const decoded = verifyJWT(token) as { email: string };
                email = decoded.email;

            }


            await this.authService.resetPassword(email, newPassword, confirmPassword, language);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].User.reset_password,
            });
        } catch (error) {
            next(error)
        }
    };

    public getAllUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const createdBy = req.user._id
            const language = req.userLanguage ?? 'en'

            const users = await this.authService.getAllUser(createdBy, language);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].General.get_all_success.replace('##', messages[language].User.user),
                data: users,
            });
        } catch (error) {
            next(error)
        }
    };

    public logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const language = req.userLanguage ?? 'en'
            if (!req.user) {
                throw new HttpException(status.Unauthorized, messages[language].invalid.replace('##', messages[language].user));
            }

            await this.authService.logout(req.user, language);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].User.succ_logout,
            });
        } catch (error) {
            next(error)
        }
    };

    public getByUserId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id
            const language = req.userLanguage ?? 'en'
            
            const user = await this.authService.getByUserId(userId, language);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: messages[language].General.get_success.replace('##', messages[language].User.user),
                data: user,
            });
        } catch (error) {
            next(error)
        }
    };
}