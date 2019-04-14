import { VersusRoom } from "./versus.room";

export class VersusRoomService {
    private static _instance: VersusRoomService;

    /**
     * Key - guid
     * Value - VersusRoom
     */
    private roomsMap: Map<string, VersusRoom> = new Map<string, VersusRoom>();

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

    constructor() { }

    createRoom(clientIds: string[], distance: number): Promise<VersusRoom> {
        return new Promise((resolve, reject) => {
            const room = new VersusRoom(clientIds, distance);
            const url = room.url;

            resolve(room);
        });
    }
}
