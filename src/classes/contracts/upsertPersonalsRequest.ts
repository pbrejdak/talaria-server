import { IUser } from "../../models/user.model";

export interface IUpsertPersonalsRequest {
    surname: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}
