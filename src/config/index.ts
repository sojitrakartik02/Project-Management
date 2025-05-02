
import { config } from "dotenv";
config({ path: ".env" })

export const {
    NODE_ENV, PORT, DB_URL, SECRET_KEY, LOG_DIR, LOG_FORMAT,
    RATE_LIMIT_GLOBAL,
    FRONTEND_URL,
    OTP_LENGTH,
    OTP_EXPIRY_TIME_MIN,
    TOKEN_EXPIRY,
    RESET_WINDOW_MINUTES,
    LOGIN_ATTEMPT,
    REMEMBER_ME_TOKEN_EXPIRY,
    FORGOT_PASSWORD_TOKEN_EXPIRY
} = process.env