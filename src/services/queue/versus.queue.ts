// import * as WebSocketServer from 'ws';
import * as SocketIO from 'socket.io';
import { newGuid, getWSPath } from '../../classes/Helper';
import { QueueTypeEnum } from '../../classes/enums/queue-type.enum';
import { IncomingMessage } from 'http';
import { SocketClient } from '../../classes/models/socketClient';
import { IVersusQeueueResponse, IVersusQeueuData } from './versus-queue.response';
import { QueueSocketResponseType } from '../../classes/enums/queue-socket-response-type.enum';
import { ActivityType } from '../../classes/enums/activity-type.enum';

import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import { VersusRoomService } from '../room/versus-room.service';
import { VersusRoom } from '../room/versus.room';
import { ServerPortEnum } from '../../Constants';

export class VersusQueue {
    constructor(activityType: ActivityType, id: string, distance: number) {
        this._id = id;
        this._serverPort = ServerPortEnum.VERSUS_QUEUE;
        this._wsPath = getWSPath(QueueTypeEnum.VERSUS, activityType, id, this._serverPort);
        this.createServer();
    }

    private _id: string;
    private _distance: number;
    private _wsPath: string;
    private _serverPort: number;

    get wsPath(): string {
        return this._wsPath;
    }

    get url() {
        return `http://51.38.134.31:${this._serverPort}`;
    }

    private clients: SocketClient[] = [];
    private pingInterval: any;

    private createServer() {
        const app = express();
        const server = http.createServer(app);
        const io = socketIO.listen(server, {
            path: this._wsPath
        });
        console.log(`Current connection ip ${this._wsPath}`);
        io.on('connection', (client: SocketClient) => this.onClientConnected(client));
        server.listen(this._serverPort);
    }

    private createSocketResponse(type: QueueSocketResponseType, clientId?: string, roomUrl?: string, path?: string) {
        const message = {} as IVersusQeueueResponse;
        message.type = type;
        message.status = 200;

        const data = {} as IVersusQeueuData;
        data.roomUrl = roomUrl;
        data.clientId = clientId;
        data.path = path;
        message.data = data;

        return message;
    }

    private onClientConnected(client: SocketClient) {
        console.log('connected');
        client.on('disconnect', (...args) => this.onClientClose(client, args));

        client.clientId = newGuid();

        if (this.clients.length === 0) {
            console.log(`Client is waiting for partner to match. clientId: ${client.clientId}`);
            this.clients.push(client);

        } else {
            if (!VersusRoomService.instance) VersusRoomService.createInstance();

            const matched = this.clients.shift();
            console.log(`Client matched. client: ${client.clientId} matchedClient: ${client.clientId}`);
            VersusRoomService.instance.createRoom([client.clientId, matched.clientId], this._distance)
                .then((res: VersusRoom) => {
                    matched.emit('matched',
                        this.createSocketResponse(QueueSocketResponseType.MATCH_FOUND, matched.clientId, res.url, res.path));
                    client.emit('matched',
                        this.createSocketResponse(QueueSocketResponseType.MATCH_FOUND, client.clientId, res.url, res.path));

                    setTimeout(() => [matched, client].forEach(c => this.removeClient(c)), 5000);
                });
        }
    }

    private onClientClose(ws: SocketClient, args: any) {
        this.removeClient(ws);
    }

    private onClientError(ws: SocketClient, err: Error) {
        this.removeClient(ws);
    }

    private removeClient(ws: SocketClient) {
        const idx = this.clients.findIndex(c => c.clientId === ws.clientId);
        if (idx > -1) this.clients.splice(idx, 1);

        ws.disconnect(true);
    }
}
