import { Document, Schema, Model, model } from "mongoose";
import { mongooseObjectId } from "../Constants";
import { userName, IUser } from "./user.model";

/**
 * @swagger
 *
 * definitions:
 *   UserPersonals:
 *     type: object
 *     properties:
 *       surname:
 *         type: string
 *       street:
 *         type: string
 *       city:
 *         type: string
 *       postalCode:
 *         type: string
 *       country:
 *         type: string
 *       user:
 *         type: object
 *         $ref: '#/definitions/User'
 */
export const userPersonalsName = "UserPersonals";

export interface IUserPersonals extends Document {
    surname: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    user: IUser;
}

export interface IUserPersonalsModel {

}

const userPersonalsSchema = new Schema({
    surname: String,
    street: String,
    city: String,
    postalCode: String,
    country: String,
    user: {
        type: mongooseObjectId,
        ref: userName
    }
});

export type UserPersonals = Model<IUserPersonals> & IUserPersonalsModel & IUserPersonals;
export const UserPersonals: UserPersonals = <UserPersonals>model<IUserPersonals>(userPersonalsName, userPersonalsSchema);
export const userPersonalsPopulatePaths = [];
export const userPersonalsFullPopulatePaths = [];
