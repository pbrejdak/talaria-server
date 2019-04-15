import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import { newGuid, createRoomPath } from '../../classes/Helper';
import { SocketClient } from '../../classes/models/socketClient';
import { IVersusFinishResponse } from './versus-finish.response';
import { ServerPortEnum } from '../../Constants';
import { VersusFinishType } from '../../classes/enums/versus-finish-type.enum';

export class VersusRoom {
    constructor(clientIds: string[], distance: number, httpServer: http.Server) {
        this._clientIds = clientIds;
        this._toConnect = [...clientIds];
        this._distance = distance;
        this._httpServer = httpServer;
        this._serverPort = ServerPortEnum.VERSUS_ROOMS;
        this.roomId = newGuid();
        this._url = createRoomPath(this.roomId, this._serverPort);
        this.createSocket();
    }

    private _clientIds: string[];
    private _distance: number;
    private _serverPort: number;
    private _toConnect: string[];
    private _httpServer: http.Server;

    private raceStartDate: Date;
    private raceEndDate: Date;

    /**
     * Key - client.id (not confuse of client.clientId)
     * Value - timeout handler
     */
    private clientTimeoutDisconnect: Map<string, any> = new Map<string, any>();

    /**
     * Key - client.clientId
     * Value - client
     * Authorized clients that are competitors in room
     */
    private joinedClients: Map<string, SocketClient> = new Map<string, SocketClient>();
    private roomId: string;
    private isStarted = false;
    private _url: string;
    private _io: SocketIO.Server;

    get url() { return `http://51.38.134.31:${this._serverPort}`; }
    get path() { return this._url; }

    private createSocket() {
        const io = socketIO.listen(this._httpServer, {
            path: this._url
        });

        this._io = io;
        io.on('connection', (client: SocketClient) => this.onClientConnected(client));

        setTimeout(() => {
            if (this.isStarted) return;

            this.raceEnd(null, VersusFinishType.TIMEOUT);
        }, 15000);
    }

    private onClientConnected(client: SocketClient) {
        console.log(`connected ${client.conn.remoteAddress}`);
        const timeout = setTimeout(() => {
            client.disconnect(true);
            this.clientTimeoutDisconnect.delete(client.id);
        }, 3000);
        this.clientTimeoutDisconnect.set(client.id, timeout);

        client.emit("userConnected", true);

        client.on('disconnect', () => this.onClientDisconnected(client));

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

        // count to 5 (sec) then start race
        this.startCountdown(5);
    }

    private onClientDisconnected(client: SocketClient) {
        if (this.clientTimeoutDisconnect.has(client.id)) {
            clearTimeout(this.clientTimeoutDisconnect.get(client.id));
            this.clientTimeoutDisconnect.delete(client.id);
        }

        if (client.clientId) {
            if (this._clientIds.indexOf(client.clientId) > -1) {
                this.forceFinishRace(client);
            }
        }
    }

    private startCountdown(number: number) {
        if (number === 0) return this.startRace();

        this._io.emit('countdown', number);
        setTimeout(() => this.startCountdown(--number), 1000);
    }

    private startRace() {
        const clients = Array.from(this.joinedClients.values());
        clients.forEach((client) => {
            // when client update his progress
            client.on('progress', (progress) => this.onProgressChange(progress, clients, client));
        });
        this.isStarted = true;
        this.raceStartDate = new Date();
        this._io.emit('start', true);
    }

    private onProgressChange(progress: any, clients: SocketClient[], sender: SocketClient) {
        console.log(`clientId: ${sender.clientId} isStarted: ${this.isStarted}, progress: ${progress}`);
        if (!this.isStarted) return;
        const clientsToSend = clients.filter(c => c.clientId !== sender.clientId);
        // send to other competitors progress of current client
        clientsToSend.forEach(c => c.emit('progressChange', progress));

        if (progress && progress.constructor === String) progress = parseFloat(progress as string);

        if (progress >= this._distance) {
            this.raceEndDate = new Date();
            this.isStarted = false;
            this.raceEnd(sender);
        }
    }

    private raceEnd(winner: SocketClient, type: VersusFinishType = VersusFinishType.WIN) {
        const response = {} as IVersusFinishResponse;

        // winner is not defined for versus finish type TIMEOUT
        if (winner) response.winnerId = winner.clientId;

        response.timeEnd = this.raceEndDate;
        response.timeStart = this.raceStartDate;

        if (type === VersusFinishType.WIN) response.time = this.raceEndDate.getTime() - this.raceStartDate.getTime();
        response.type = type;
        this._io.emit('finish', response);

        setTimeout(() => this.closeRoom(), 5000);
    }

    private forceFinishRace(disconnectedClient: SocketClient) {
        const winnerId = this._clientIds.find(id => id !== disconnectedClient.clientId);
        const winner = this.joinedClients.get(winnerId);
        if (this.isStarted) {
            this.raceEnd(winner, VersusFinishType.DISCONNECTED);
        } else {
            this.raceEnd(winner, VersusFinishType.CANCEL);
        }
    }

    private closeRoom() {
        this.joinedClients.forEach(c => c.disconnect(true));
        this._io.close();
    }
}
