import { Router } from 'express';
import { AuthController } from '@Auth/controllers/auth.controller';
import { authMiddleware, isAdmin } from '@middlewares/authMiddleware'
import { validationMiddleware } from '@middlewares/validation.middleware';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto, VerifyOtpDto } from '@Auth/dtos/auth.dto';
import { globalRateLimiter } from '@middlewares/rateLimit.middleware';
import { Routes } from '@interface/routes.interface';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication operations
 */

export class AuthRoute implements Routes {
    public router = Router();
    public authController = new AuthController();
    public path = '/auth'
    constructor() {

        this.initializeRoutes();

    }

    public initializeRoutes() {

        this.router.post(`${this.path}/signin`, globalRateLimiter, validationMiddleware(LoginDto), this.authController.login);

        this.router.post(`${this.path}/forgot-password`, globalRateLimiter, validationMiddleware(ForgotPasswordDto), this.authController.forgotPassword);
        this.router.post(`${this.path}/request-new-otp`, globalRateLimiter, this.authController.resendOtp);

        this.router.post(`${this.path}/verify-otp`, globalRateLimiter, validationMiddleware(VerifyOtpDto), this.authController.verifyOTP);
        this.router.post(`${this.path}/reset-password`, globalRateLimiter, validationMiddleware(ResetPasswordDto), this.authController.resetPassword);
        this.router.get(`${this.path}/getAllUsers`, globalRateLimiter, isAdmin, this.authController.getAllUser)
        this.router.get(`${this.path}/signout`, authMiddleware, globalRateLimiter, this.authController.logout)
        this.router.get(`${this.path}/:id`, globalRateLimiter, this.authController.getByUserId)
        this.router.post(`${this.path}/refresh-token`, globalRateLimiter, this.authController.refreshToken);
    }
}


