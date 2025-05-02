
import { config } from "dotenv";
config({ path: ".env" })

export const {
    NODE_ENV, PORT, DB_URL, SECRET_KEY, LOG_DIR, LOG_FORMAT
} = process.env