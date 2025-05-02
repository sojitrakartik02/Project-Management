import rateLimit from "express-rate-limit";
import { HttpException } from "../utils/exceptions/httpException";
import { status, messages } from "../utils/helpers/api.responses";
import { RATE_LIMIT_GLOBAL } from "../config/index";

export const globalRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: Number(RATE_LIMIT_GLOBAL), // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res, next, options) => {
        const language = req.userLanguage ?? 'English';
        const err = new HttpException(
            status.TooManyRequests,
            messages[language]?.General?.rate_limit_exceeded ??
            "Too many requests from this IP, please try again later."
        );
        next(err);
    },
});

