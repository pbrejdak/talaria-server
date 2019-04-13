import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model';
import { IAuthToken } from '../classes/models/user/authToken';
import { ErrorMessageConstants } from '../classes/errorMessageConstants';

/**
 * http(s) middleware guard
 * @param e.Request req
 * @param e.Response res
 * @param e.NextFunction next
 * @returns Response
 */
export const guard = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, process.env.APPLICATION_SECRET, (err, tokenUser: IAuthToken) => {
            if (err) {
                console.error(err);
                res.status(401);
                return res.json({
                    success: false,
                    message: ErrorMessageConstants.CANNOT_AUTHORIZE
                });
            } else {
                User.findById(tokenUser._id, (err, user) => {
                    if (!user || !user.isActive) {
                        res.status(401);
                        return res.json({
                            success: false,
                            message: ErrorMessageConstants.USER_NOT_EXIST_OR_BLOCKED
                        });
                    }
                    req.user = tokenUser;
                    next();
                });
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: ErrorMessageConstants.NOT_AUTHORIZED
        });
    }
};


declare namespace Express {
    export interface Request {
        authInfo?: any;
        user?: IAuthToken;
    }
}
