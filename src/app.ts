import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express';
import { createServer, Server } from 'http';
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { NODE_ENV, PORT, LOG_FORMAT } from '@config/index'
import { connectDatabase } from '@database/index';
import cors from 'cors'
import helmet from 'helmet';
import { Routes } from '@interface/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger as Logger, stream } from '@utils/logger';
import envCheckMiddleware from '@middlewares/envValidator';
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express';

import YAML from 'yamljs';


export class App {
    public app: express.Application;
    public env: string;
    public port: string | number;
    public httpServer: any;
    public server: any;
    public http: any;

    constructor(routes: Routes[]) {
        this.app = express();
        this.env = NODE_ENV || 'development';
        this.port = PORT || 3020;
        this.app.set('port', this.port);
        this.httpServer = createServer(this.app);

        this.http = require('http').Server(this.app)

        this.initializeMiddlewares();
        this.initializeSwagger()
        this.databaseConnection()
        this.initializeRoutes(routes)
        this.initializeErrorHandling()
    }

    private initializeMiddlewares() {

        this.app.use((req: Request, _res: Response, next: NextFunction) => {
            // const lang = req.headers['accept-language'] || req.query.lang || 'English';
            // req.userLanguage = typeof lang === 'string' ? lang.split(',')[0] : 'English';
            req.userLanguage = 'en'
            next();
        });
        this.app.use(morgan(LOG_FORMAT, { stream }));
        this.app.use(envCheckMiddleware)
        this.app.use(cors({ origin: ["http://localhost:5173"], credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] }))
        this.app.use(compression())
        this.app.use(cookieParser())
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(helmet())
        this.app.use(express.urlencoded({ extended: true }));
        this.app.disable('x-powered-by');
    }


    public async listen() {
        await new Promise((resolve, reject) => {

            this.httpServer.listen(this.port, () => {
                console.log(`==========================================`);
                console.log(`========== ENV: ${this.env} ==============`);
                Logger.info(`=== 🚀 App listening on the port ${this.port} ===`);
                console.log(`==========================================`);
                resolve(true);
            }).on('error', (error) => {
                Logger.error(`Port is already use`, error)
                reject(error)
            })
        })
    }



    public databaseConnection() {
        connectDatabase()
    }
    private initializeRoutes(routes: Routes[]) {
        routes.forEach(route => {
            this.app.use('/api/v1', route.router);

        });

        this.app.get('/ping', (_req, res) => {
            return res.status(200).send('pong');
        });
        this.app.use('*', this.routHandler);

    }


    private initializeSwagger() {
        const swaggerDocs = YAML.load('swagger.yaml')
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
    }

    public initializeErrorHandling() {
        this.app.use(ErrorMiddleware)

    }


    private routHandler(_req: Request, res: Response) {
        res.status(404).json({ message: 'Route not found' });

    }




}