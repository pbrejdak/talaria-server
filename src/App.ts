import * as dotenv from 'dotenv';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as path from 'path';
import * as swaggerUI from 'swagger-ui-express';

import * as http from 'http';
import * as socketIO from 'socket.io';

import { default as routers } from './routers';
import { PassportConfig } from './config/passport';
import { Request, Response } from 'express';
import { User } from './models/user.model';
import { allowedExt } from './Constants';
import { readFile } from 'fs';
import debug = require('debug');
// import { spec } from './swaggerGen';
const swaggerDoc = require('./swagger.json');

import * as WebSocketServer from 'ws';

class App {

    public express: express.Application;
    private serviceNotAvailable = false;

    constructor() {
        this.setEnvironment();
        this.express = express();
        this.database();
        this.middleware();
        this.routes();
        this.testWebSocket();
        this.checkAdmin();
    }


    /**
     * database connection
     */
    private database(): void {
        mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
        mongoose.connection.on('error', () => {
            debug('MongoDB connection error. Please make sure MongoDB is running.');
            // process.exit();
            this.serviceNotAvailable = true;
        });
    }

    /**
     * http(s) request middleware
     */
    private middleware(): void {
        debug(`${__dirname} its a base path`);
        this.express.use(logger('dev'));
        // set body parser
        this.express.use(bodyParser.json({ limit: '8mb' }));
        this.express.use(bodyParser.urlencoded({ extended: false }));

        // static files.
        const staticPath = path.join(__dirname, 'public');
        debug(`Serving static content from ${staticPath}. Access path is /static/public`);
        this.express.use('/static/public', express.static(staticPath));

        // Allow CORS only for development.
        this.express.use((req, res, next) => {
            if (process.env.PRODUCTION !== "true") {
                res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
                res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');
                if (req.method === 'OPTIONS') {
                    res.status(200).send();
                } else {
                    next();
                }
            }

            res.header('Access-Control-Allow-Origin', '*'); // dev only
        });

        // Serve API json file for swagger generator
        this.express.get("/get-api-description", (req, res) => {
            res.setHeader('Cache-Control', 'no-cache');
            res.sendFile(path.resolve("swagger.json"));
        });

        // no db connection
        this.express.use((req, res, next) => {
            if (this.serviceNotAvailable) {
                res.status(503).send("DB is not running :(.");
            } else {
                next();
            }
        });

        // serve Swagger API site.
        this.express.use('/get-api-def', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
        this.express.use(passport.initialize());
        this.express.use(passport.session());
        const pConfig = new PassportConfig(passport);
        pConfig.init();
    }

    /**
     * app environment configuration
     */
    private setEnvironment(): void {
        dotenv.config({ path: '.env' });
    }

    /**
     * API main v1 routes
     */
    private routes(): void {
        this.express.use('/v1', routers);
        // this.express.use(express.static('../public'));

        // serve front-end files
        this.express.get('*', (req: Request, res: Response) => {
            if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
                res.sendFile(path.resolve(`public/${req.url}`));
            } else {
                res.sendFile(path.resolve('public/index.html'));
            }
        });

        // 404.
        // this.express.use('/', (req, res) => {
        //     res.status(404).send({ error: `path doesn't exist` });
        // });
    }

    private checkAdmin() {
        User.count((err, count: number) => {
            if (count > 0) { return; }

            const user = new User({
                email: 'system@admin.com',
                password: 'system',
                name: 'System admin',
                login: 'system.admin',
                role: 3,
                indexable: false,
                creationIp: '0.0.0.0'
            });

            User.createUser(user, (err, user) => {
                if (err) { throw err; }
                console.log('system admin created');
            });
        });
    }

    private testWebSocket() {
        const server = http.createServer();
        const io = socketIO(server);
        io.on('connection', client => {
            client.on('event', data => { /* … */ });
            client.on('disconnect', () => { /* … */ });

            client.emit("test", { "bonus": "bgc" });
        });
        server.listen(8008);
    }
}

export default new App().express;
