import { VersusFinishType } from "../../classes/enums/versus-finish-type.enum";

export interface IVersusFinishResponse {
    winnerId: string;
    timeStart: Date;
    timeEnd: Date;
    time: number;
    type: VersusFinishType;
}
