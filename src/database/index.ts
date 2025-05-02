import { DB_URL, NODE_ENV } from "../config/index";
import { set, connect } from 'mongoose'
export const MongoDb = {
    url: DB_URL,
    options: {
        useNewUrlParser: true,
        useUnifieldTopology: true
    }
}
export const connectDatabase = async () => {
    if (NODE_ENV != 'production') set('debug', true)
    try {
        await connect(MongoDb.url!)
        console.log("Database Connection successfully")
    } catch (err) {
        console.error("Database Connection error", err)
        throw err
    }
}