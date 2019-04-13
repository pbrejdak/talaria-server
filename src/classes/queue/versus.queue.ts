// import * as WebSocketServer from 'ws';
import * as SocketIO from 'socket.io';
import { newGuid, getWSPath } from '../Helper';
import { QueueTypeEnum } from '../enums/queue-type.enum';
import { IncomingMessage } from 'http';
import { WebSocketClient } from './webSocketClient';
import { IVersusQeueueResponse, IVersusQeueuData } from './versus-queue.response';
import { QueueSocketResponseType } from '../enums/queue-socket-response-type.enum';
import { ActivityType } from '../enums/activity-type.enum';

export class VersusQueue {
    constructor(activityType: ActivityType, id: string) {
        this._id = id;
        this._wsPath = getWSPath(QueueTypeEnum.VERSUS, activityType, id);
        this.createServer();
    }

    private _id: string;
    private _wsPath: string;

    get wsPath(): string {
        return this._wsPath;
    }

    private clients: WebSocketClient[] = [];
    private pingInterval: any;

    private createServer() {

    }

    private createSocketResponse(type: QueueSocketResponseType, isServer?: boolean, serverIp?: string) {
        const message = {} as IVersusQeueueResponse;
        message.type = type;
        message.status = 200;

        const data = {} as IVersusQeueuData;
        data.deviceIp = serverIp;
        data.isServer = isServer;
        message.data = data;

        return message;
    }

    private onClientClose(ws: WebSocketClient, code: number, reason: string) {
        this.removeClient(ws);
    }

    private onClientError(ws: WebSocketClient, err: Error) {
        this.removeClient(ws);
    }

    private removeClient(ws: WebSocketClient) {
        const idx = this.clients.findIndex(c => c.clientId === ws.clientId);
        if (idx > -1) this.clients.splice(idx, 1);

        ws.terminate();
    }

}

    // private createServer() {
    //     const noop = function () { };
    //     const wss = new WebSocketServer.Server({
    //         port: 8080,
    //         path: `${this._id}`,
    //         perMessageDeflate: {
    //             zlibDeflateOptions: {
    //                 // See zlib defaults.
    //                 chunkSize: 1024,
    //                 memLevel: 7,
    //                 level: 3
    //             },
    //             // Other options settable:
    //             clientNoContextTakeover: true, // Defaults to negotiated value.
    //             serverNoContextTakeover: true, // Defaults to negotiated value.
    //             serverMaxWindowBits: 10, // Defaults to negotiated value.
    //             // Below options specified as default values.
    //             concurrencyLimit: 10, // Limits zlib concurrency for perf.
    //             threshold: 1024 // Size (in bytes) below which messages
    //             // should not be compressed.
    //         }
    //     });

    //     wss.on('connection', (ws: WebSocketClient, request: IncomingMessage) => {
    //         ws.on('open', () => {
    //             ws.clientId = newGuid();
    //             ws.remoteAddress = request.connection.remoteAddress;
    //             ws.remotePort = request.connection.remotePort;

    //             if (this.clients.length === 0) {
    //                 this.clients.push(ws);

    //             } else {
    //                 const matched = this.clients.shift();
    //                 matched.send(this.createSocketResponse(QueueSocketResponseType.MATCH_FOUND, true, null));

    //                 ws.send(this.createSocketResponse(QueueSocketResponseType.MATCH_FOUND, false, ws.remoteAddress));
    //             }
    //         });
    //         ws.on('close', (code: number, reason: string) => this.onClientClose(ws, code, reason));
    //         ws.on('error', (err: Error) => this.onClientError(ws, err));
    //         ws.on('pong', () => ws.isAlive = true);
    //     });

    //     this.pingInterval = setInterval(() => {
    //         wss.clients.forEach((ws: WebSocketClient) => {
    //             if (ws.isAlive === false) return ws.terminate();

    //             ws.isAlive = false;
    //             ws.ping(noop);
    //         });
    //     }, 30000);
    // }
