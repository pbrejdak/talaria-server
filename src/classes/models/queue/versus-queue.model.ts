import { Document, Schema, Model, model } from "mongoose";

/**
 * @swagger
 *
 * definitions:
 *   VersusQueue:
 *     type: object
 *     properties:
 *       foo:
 *         type: string
 */
export const versusQueueName = "VersusQueue";

export interface IVersusQueue extends Document {

}

export interface IVersusQueueModel {

}

const versusQueueSchema = new Schema({

});

export type VersusQueue = Model<IVersusQueue> & IVersusQueueModel & IVersusQueue;
export const VersusQueue: VersusQueue = <VersusQueue>model<IVersusQueue>(versusQueueName, versusQueueSchema);
export const versusQueuePopulatePaths = [];
export const versusQueueFullPopulatePaths = [];
