import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import { newGuid, createRoomPath } from '../../classes/Helper';
import { SocketClient } from '../../classes/models/socketClient';
import { IVersusFinishResponse } from './versus-finish.response';
import { ServerPortEnum } from '../../Constants';

export class VersusRoom {
    constructor(clientIds: string[], distance: number) {
        this._clientIds = clientIds;
        this._toConnect = [...clientIds];
        this._distance = distance;
        this._serverPort = ServerPortEnum.VERSUS_ROOMS;
        this.roomId = newGuid();
        this._url = createRoomPath(this.roomId, this._serverPort);
        this.createSocket();
    }

    private _clientIds: string[];
    private _distance: number;
    private _serverPort: number;
    private _toConnect: string[];

    private raceStartDate: Date;
    private raceEndDate: Date;

    private clientTimeoutDisconnect: Map<string, any> = new Map<string, any>();
    private joinedClients: Map<string, SocketClient> = new Map<string, SocketClient>();
    private roomId: string;
    private isStarted = false;
    private _url: string;
    private _io: SocketIO.Server;

    get url() { return `http://51.38.134.31:this._serverPort`; }
    get path() { return this._url; }

    private createSocket() {
        const app = express();
        const server = http.createServer(app);
        const io = socketIO.listen(server, {
            path: this._url
        });
        this._io = io;
        io.on('connection', (client: SocketClient) => this.onClientConnected(client));
        server.listen(this._serverPort);
    }

    private onClientConnected(client: SocketClient) {
        console.log(`connected ${client.conn.remoteAddress}`);
        const timeout = setTimeout(() => {
            client.disconnect();
            this.clientTimeoutDisconnect.delete(client.id);
        }, 3000);
        this.clientTimeoutDisconnect.set(client.id, timeout);

        client.emit("userConnected", true);

        client.on('join', (clientId: string) => {
            const exists = this._clientIds.indexOf(clientId) > -1;
            if (exists) {
                const timeout = this.clientTimeoutDisconnect.get(client.id);
                if (timeout) clearTimeout(timeout);
                this.clientTimeoutDisconnect.delete(client.id);
                client.clientId = clientId;
                this.joinedClients.set(clientId, client);

                this.clientAccepted(clientId);
            }
        });
    }

    private clientAccepted(clientId: string) {
        const idx = this._toConnect.indexOf(clientId);
        if (idx > -1) this._toConnect.splice(idx, 1);

        if (this._toConnect.length === 0) this.onClientsReady();
    }

    private onClientsReady() {
        this._io.emit('ready', true);

        this.startCountdown(5);
    }

    private startCountdown(number: number) {
        if (number === 0) return this.startRace();

        this._io.emit('countdown', number);
        setTimeout(() => this.startCountdown(--number), 1000);
    }

    private startRace() {
        const clients = Array.from(this.joinedClients.values());
        clients.forEach((client) => {
            client.on('progress', (progress) => this.onProgressChange(progress, clients, client));
        });
        this.isStarted = true;
        this.raceStartDate = new Date();
        this._io.emit('start', true);
    }

    private onProgressChange(progress: any, clients: SocketClient[], sender: SocketClient) {
        if (!this.isStarted) return;
        const clientsToSend = clients.filter(c => c.clientId !== sender.clientId);
        clientsToSend.forEach(c => c.emit('progressChange', progress));

        if (progress && progress.constructor === String) progress = parseFloat(progress as string);

        if (progress >= this._distance) {
            this.raceEndDate = new Date();
            this.isStarted = false;
            this.raceEnd(sender, clientsToSend[0]);
        }
    }

    private raceEnd(winner: SocketClient, loser: SocketClient) {
        const response = {} as IVersusFinishResponse;
        response.winnerId = winner.clientId;
        response.timeEnd = this.raceEndDate;
        response.timeStart = this.raceStartDate;
        response.time = this.raceEndDate.getTime() - this.raceStartDate.getTime();
        this._io.emit('finish', response);

        setTimeout(() => this.closeRoom(), 5000);
    }

    private closeRoom() {
        this.joinedClients.forEach(c => c.disconnect());
        this._io.close();
    }
}
