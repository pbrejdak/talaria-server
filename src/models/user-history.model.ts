import { Document, Schema, Model, model } from "mongoose";
import { HistoryType } from "../classes/enums/history-type.enum";
import { ActivityType } from "../classes/enums/activity-type.enum";
import { EnvironmentType } from "../classes/enums/environment-type.enum";
import { mongooseObjectId } from "../Constants";
import { userName } from "./user.model";

/**
 * @swagger
 *
 * definitions:
 *   Waypoint:
 *     type: object
 *     properties:
 *       lang:
 *         type: number
 *       lat:
 *         type: number
 *   UserHistory:
 *     type: object
 *     properties:
 *       historyType:
 *         type: number
 *         description: HistroyType enum
 *       distance:
 *         type: number
 *         description: distance in metres
 *       activityType:
 *         type: number
 *         description: ActivityType enum
 *       environmentType:
 *         type: number
 *         description: EnvironmentType enum
 *       roadPath:
 *         type: Array
 *         items:
 *           $ref: "#/definitions/Waypoint"
 *         description: Array of waypoints to recreate in app (optional)
 */
export const userHistoryName = "UserHistory";

export interface IUserHistory extends Document {
    historyType: HistoryType;
    distance: number;
    activityType: ActivityType;
    environmentType: EnvironmentType;
    roadPath: Array<any>;
}

export interface IUserHistoryModel {

}

const userHistorySchema = new Schema({
    historyType: {
        type: Number,
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    activityType: {
        type: Number,
        required: true
    },
    environmentType: {
        type: Number,
        required: true
    },
    roadPath: [{
        lang: {
            type: Number
        },
        lat: {
            type: Number
        }
    }],
    user: {
        type: mongooseObjectId,
        ref: userName
    }
});

export type UserHistory = Model<IUserHistory> & IUserHistoryModel & IUserHistory;
export const UserHistory: UserHistory = <UserHistory>model<IUserHistory>(userHistoryName, userHistorySchema);
export const userHistoryPopulatePaths = [];
export const userHistoryFullPopulatePaths = [];
