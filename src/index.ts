import * as http from 'http';
import * as https from 'https';
import * as debug from 'debug';
import * as winston from 'winston';

import { existsSync, readFileSync } from 'fs';

import App from './App';
import Constants from './Constants';
import { join } from 'path';


class Server {

    public constructor() {
        this.debugMod();
        this.getCertificates();
        this.runServer();
    }

    private static serverInstance: Server;
    private server: any;
    private port: number;
    private isHttps = false;
    private httpsOptions = {};
    private redirectServer: any;

    public static bootstrap(): Server {
        if (!this.serverInstance) {
            this.serverInstance = new Server();
            return this.serverInstance;
        } else {
            return this.serverInstance;
        }

    }

    public getServerInstance(): any {
        return this.server;
    }


    private debugMod(): void {
        debug('ts-express:server');
        winston.add(winston.transports.File, { filename: 'application.log' });
    }

    private getCertificates() {
        if (existsSync(join(__dirname, Constants.CERTIFICATE_PATHS))) {
            try {
                const paths: string = readFileSync(join(__dirname, Constants.CERTIFICATE_PATHS), { encoding: 'utf8' });
                const [cert, key] = paths.split(/\n/);
                const certificate = readFileSync(join(__dirname, cert.trim()));
                const privateKey = readFileSync(join(__dirname, key.trim()));
                this.httpsOptions = { cert: certificate, key: privateKey };
                this.isHttps = true;
            } catch (err) {
                this.isHttps = false;
                console.error(err);
            }
        } else {
            this.isHttps = false;
        }
    }

    private runServer(): void {
        this.port = this.normalizePort(process.env.PORT || 3501);

        if (this.isHttps) { this.port = 443; } // https;

        App.set('port', this.port);
        this.createServer();
    }

    private createServer() {

        if (this.isHttps) {
            this.server = https.createServer(this.httpsOptions, App);
            this.server.listen(this.port, '0.0.0.0');
            debug('server is run by https');

            this.redirectServer = http.createServer((req, res) => {
                res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
                res.end();
            });
            this.redirectServer.listen(80, '0.0.0.0');
            // this.redirectServer.get('*', function (req, res) {
            //     res.redirect('https://' + req.headers.host + req.url);
            // });

        } else {
            this.server = http.createServer(App);
            this.server.listen(this.port, '0.0.0.0');
            debug('servier is run by http');

        }

        this.server.on('listening', () => {
            const address = this.server.address();
            debug(`listenning on ${address}`);
            const bind = (typeof address === 'string') ? `pipe ${address}` : `port ${address.port}`;
            debug(`Listening on ${bind}`);
        });

        this.server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.syscall !== 'listen') { throw error; }
            console.error(error);
            process.exit(1);
        });
    }

    /**
     * normalize port
     */
    private normalizePort(val: number | string): number {
        const port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        return port;
    }

}

export const server = Server.bootstrap();
