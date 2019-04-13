export enum ErrorMessageConstants {
    //#region guard
    CANNOT_AUTHORIZE = "CANNOT_AUTHORIZE",
    USER_NOT_EXIST_OR_BLOCKED = "USER_NOT_EXIST_OR_BLOCKED",
    NOT_AUTHORIZED = "NOT_AUTHORIZED",
    //#endregion


    //#region auth
    FIND_BY_EMAIL = "FIND_BY_EMAIL",
    EMAIL_INCORRECT = "EMAIL_INCORRECT",
    PASSWORD_INCORRECT = "PASSWORD_INCORRECT",
    USER_EXIST = "USER_EXIST",
    LOGIN_FAILED = "LOGIN_FAILED",
    LOGIN_ERROR = "LOGIN_ERROR",
    NEW_PASSWORD_NOT_MATCH = "NEW_PASSWORD_NOT_MATCH",
    PASSWORD_NOT_MATCH = "PASSWORD_NOT_MATCH",
    //#endregion


    //#region generic
    WRONG_INPUT = "WRONG_INPUT",
    UNKOWN_ERROR = "UNKOWN_ERROR",
    MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
    //#endregion


    SEARCH_TEMPLATES = "SEARCH_TEMPLATES",
    GET_LINKED_TEMPLATES = "GET_LINKED_TEMPLATES",
}

export const errSeparator = " $";

export const combineErr = (...errIds: string[]) => {
    return `${errIds.join(errSeparator)}`;
};
