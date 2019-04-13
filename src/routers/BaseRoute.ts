import { Router, Response } from 'express';
import * as winston from 'winston';

import { guard } from '../middleware/guard';

/**
 * @swagger
 *
 * securityDefinitions:
 *   bearerAuth:
 *     type: apiKey
 *     in: header
 *     name: authorization
 * definitions:
 *   BaseResponse:
 *     type: object
 *     required:
 *       - success
 *     properties:
 *       success:
 *         type: boolean
 *   TokenResponse:
 *     type: object
 *     required:
 *       - success
 *       - token
 *     properties:
 *       success:
 *         type: boolean
 *       token:
 *         type: string
 *   ErrorResponse:
 *     type: object
 *     required:
 *       - success
 *       - message
 *     properties:
 *       success:
 *         type: boolean
 *       message:
 *         type: string
 */

export abstract class BaseRoute {

    private readonly _registeredMethodEnding = 'Action';
    router: Router;
    logger: any;
    guard: any;
    roleGuard: any;

    constructor() {
        this.guard = guard;
        this.logger = winston;
        this.onInit();
        this.router = Router();
        this.initRoutes();
    }

    public getRoutes(): Router {
        return this.router;
    }

    getRouterMethodNames(obj): Set<string> {
        const methods = new Set();
        while (obj = Reflect.getPrototypeOf(obj)) {
            const keys = Reflect.ownKeys(obj);
            keys.forEach((k) => {
                if (k.toString().indexOf(this._registeredMethodEnding,
                    (k.toString().length - this._registeredMethodEnding.length)) !== -1) {
                    methods.add(k);
                }
            });
        }
        return methods;
    }

    protected onInit(): void { }

    private initRoutes(): void {
        const methods = this.getRouterMethodNames(this);
        // console.log(methods);
        [...methods].map((method) => {
            this[method](this.router);
        });
    }

    protected sendResponse(data: any, res: Response, status: number = 200) {
        res.status(status);
        res.json(data);
    }

    protected sendWrongCredentials(res: Response) {
        res.status(400);
        res.json({
            success: false,
            message: 'wrong credentials.'
        });
    }

    protected sendError(res: Response, err: Error | string, prodErrorMsg?: string) {
        if (prodErrorMsg && process.env.PRODUCTION) {
            err = prodErrorMsg;
        } else {
            if (err.constructor === Error) {
                err = err.toString();
            } else if (err.constructor === String) {
                err = err;
            }
        }

        res.status(400);
        res.json({
            success: false,
            error: err,
            isError: true,
            message: prodErrorMsg
        });
    }

    protected sendWrongInput(res: Response, message?: string) {
        res.status(400);
        res.json({
            success: false,
            message: message
        });
    }

    protected sendNotAuthorized(res: Response, message?: string) {
        res.status(403);
        res.json({
            success: false,
            message: message || "Not enough permissions"
        });
    }
}

