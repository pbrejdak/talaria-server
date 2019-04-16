import { VersusRoom } from "./versus.room";
import * as http from "http";
import * as express from 'express';
import { ServerPortEnum } from "../../Constants";
import * as socketIO from 'socket.io';

export class VersusRoomService {
    private static _instance: VersusRoomService;

    /**
     * Key - guid
     * Value - VersusRoom
     */
    private roomsMap: Map<string, VersusRoom> = new Map<string, VersusRoom>();
    private _io: socketIO.Server;

    static get instance(): VersusRoomService {
        return VersusRoomService._instance;
    }

    static createInstance() {
        if (VersusRoomService._instance) {
            console.warn("WARNING. VersusRoomService is already created.");
            return VersusRoomService._instance;
        } else {
            VersusRoomService._instance = new VersusRoomService();
        }
    }

    constructor() {
        const app = express();
        const server = http.createServer(app);
        const io = socketIO.listen(server);
        // TODO: ROOM Recycling
        server.listen(ServerPortEnum.VERSUS_ROOMS);
        this._io = io;
    }

    createRoom(clientIds: string[], distance: number): Promise<VersusRoom> {
        return new Promise((resolve, reject) => {
            const room = new VersusRoom(clientIds, distance, this._io);
            const url = room.url;

            resolve(room);
        });
    }
}
