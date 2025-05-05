import { jsonStatus, messages, status } from "@utils/helpers/api.responses";

const requiredEnvVars = [
    'TOKEN_EXPIRY',
    'OTP_LENGTH',
    'OTP_EXPIRY_TIME_MIN',
    'GMAIL_PASSWORD',
    'GMAIL_USER',
    'EMAIL_SERVICE',
    'NODE_ENV',
    'PORT',
    'DB_URL',
    'SECRET_KEY',
    'REFRESH_TOKEN'
    // 'BASE_URL',
    // 'FRONTEND_URL',
    // 'BACKEND_SERVER_URL'
];

const envCheckMiddleware = (req, res, next) => {
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingVars.length > 0) {
        return res.status(status.InternalServerError).json({
            status: jsonStatus.BadRequest,
            messages: messages[req.userLanguage].General.missing.replace("##", missingVars)
        });
    }

    next();
};

export default envCheckMiddleware;