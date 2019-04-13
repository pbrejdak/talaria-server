import { RoleEnum } from "../../enums/role.enum";

export interface IAuthToken {
    _id: string;
    name: string;
    email: string;
    role: RoleEnum;
}
