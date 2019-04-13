import { QueueSocketResponseType } from "../enums/queue-socket-response-type.enum";

export interface IVersusQeueueResponse {
    status: number;
    type: QueueSocketResponseType;
    data: IVersusQeueuData;
}

export interface IVersusQeueuData {
    isServer: boolean;
    deviceIp: string;
}
