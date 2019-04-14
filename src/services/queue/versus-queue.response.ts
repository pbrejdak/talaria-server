import { QueueSocketResponseType } from "../../classes/enums/queue-socket-response-type.enum";

export interface IVersusQeueueResponse {
    status: number;
    type: QueueSocketResponseType;
    data: IVersusQeueuData;
}

export interface IVersusQeueuData {
    roomUrl: string;
    clientId: string;
    path: string;
}
