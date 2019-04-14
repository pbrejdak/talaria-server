import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import { newGuid, createRoomPath } from '../../classes/Helper';
import { SocketClient } from '../../classes/models/socketClient';

export class VersusRoom {
    constructor(clientIds: string[], distance: number) {
        this.clientIds = clientIds;
        this.toConnect = [...clientIds];
        this.roomId = newGuid();
        this._url = createRoomPath(this.roomId, 9010);
        this.createSocket();
    }

    private clientIds: string[];
    private distance: number;

    private toConnect: string[];
    private dateStart: Date;
    private clientTimeoutDisconnect: Map<string, any> = new Map<string, any>();
    private joinedClients: Map<string, SocketClient> = new Map<string, SocketClient>();
    private roomId: string;
    private isStarted = false;
    private _url: string;
    private _io: SocketIO.Server;

    get url() { return `http://51.38.134.31:9010`; }
    get path() { return this._url; }

    private createSocket() {
        const app = express();
        const server = http.createServer(app);
        const io = socketIO.listen(server);
        this._io = io;
        io.on('connection', (client: SocketClient) => this.onClientConnected(client));
        server.listen(9010);
    }

    private onClientConnected(client: SocketClient) {
        const timeout = setTimeout(() => {
            client.disconnect();
            this.clientTimeoutDisconnect.delete(client.id);
        }, 3000);
        this.clientTimeoutDisconnect.set(client.id, timeout);

        client.emit("userConnected", true);

        client.on('join', (clientId: string) => {
            const exists = this.clientIds.indexOf(clientId) > -1;
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
        const idx = this.toConnect.indexOf(clientId);
        if (idx > -1) this.toConnect.splice(idx, 1);

        if (this.toConnect.length === 0) this.onClientsReady();
    }

    private onClientsReady() {
        this._io.emit('ready', true);

        this.startCountdown(5);
    }

    private startCountdown(number: number) {
        if (number === 0) this.startRace();

        this._io.emit('countdown', number);
        setTimeout(() => this.startCountdown(--number), 1000);
    }

    private startRace() {
        const clients = Array.from(this.joinedClients.values());
        clients.forEach((client) => {
            client.on('progress', (progress) => this.onProgressChange(progress, clients, client));
        });
        this.isStarted = true;
        this.dateStart = new Date();
        this._io.emit('start', true);
    }

    private onProgressChange(progress: number, clients: SocketClient[], sender: SocketClient) {
        if (!this.isStarted) return;
        const clientsToSend = clients.filter(c => c.clientId !== sender.clientId);
        clientsToSend.forEach(c => c.emit('progressChange', progress));
    }
}
