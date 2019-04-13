import { Router, Request, Response } from 'express';

import { BaseRoute } from '../BaseRoute';
import { UserPersonals, IUserPersonals, userPersonalsPopulatePaths } from '../../models/user-personals.model';
import { ErrorMessageConstants } from '../../classes/errorMessageConstants';
/**
 * @swagger
 *
 * definitions:
 *   UpsertUserPersonals:
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
 *   UserPersonalsResponse:
 *     allOf:
 *     - $ref: '#/definitions/BaseResponse'
 *     - type: object
 *     - required:
 *       - user
 *       properties:
 *         user:
 *           type: object
 *           $ref: '#/definitions/UserPersonals'
 *   GetUserPersonalssResponse:
 *     allOf:
 *     - $ref: '#/definitions/BaseResponse'
 *     - type: object
 *     - required:
 *       - users
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/definitions/UserPersonals'
 *   GetAllUserPersonalssResponse:
 *     allOf:
 *     - $ref: '#/definitions/BaseResponse'
 *     - type: object
 *     - required:
 *       - users
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/definitions/UserPersonals'
 *   UpsertUserPersonalsRequest:
 *     type: object
 *     required:
 *     - user
 *     properties:
 *       user:
 *         type: object
 *         $ref: '#/definitions/UpsertUserPersonals'
 * tags:
 * - name: user
 */

export class UserPersonalsRouter extends BaseRoute {
    /**
     * @swagger
     * /user/user-personals:
     *    put:
     *      operationId: createUserPersonals
     *      tags:
     *        - user
     *      description: This should add UserPersonals
     *      produces:
     *        - application/json
     *      consume:
     *        - application/json
     *      parameters:
     *        - in: header
     *          name: authorization
     *          type: string
     *          required: true
     *          description: JWT auth
     *        - in: body
     *          name: request
     *          required: true
     *          schema:
     *            type: object
     *            $ref: '#/definitions/UpsertUserPersonalsRequest'
     *      responses:
     *        200:
     *          description: base response if succeed with success on true
     *          schema:
     *            $ref: '#/definitions/UserPersonalsResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            $ref: '#/definitions/ErrorResponse'
     *
     */
    public addAction(router: Router): void {
        router.put('/user-personals', this.guard, (req: Request, res: Response) => {
            const personals = req.body;

            const newPersonals = UserPersonals.hydrate(personals);
            newPersonals.user = req.user._id;
            newPersonals.save((err, user: IUserPersonals) => {
                if (err) return this.sendError(res, err, ErrorMessageConstants.WRONG_INPUT);

                this.sendResponse({ success: true, user: newPersonals }, res);
            });
        });
    }

    /**
     * @swagger
     * /user/user-personals/{id}:
     *    get:
     *      operationId: getUserPersonals
     *      tags:
     *        - user
     *      description: This should return UserPersonals with specified {id} param,
     *      produces:
     *        - application/json
     *      parameters:
     *        - in: header
     *          name: authorization
     *          type: string
     *          required: true
     *          description: JWT auth
     *        - in: path
     *          name: id
     *          required: true
     *          type: string
     *          description: ID of UserPersonals
     *      responses:
     *        200:
     *          description: base response if succeed with success on true
     *          schema:
     *            $ref: '#/definitions/UserPersonalsResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            $ref: '#/definitions/ErrorResponse'
     */
    public getAction(router: Router): void {
        router.get('/user-personals/:id', this.guard, (req: Request, res: Response) => {
            const id = req.params.id;

            UserPersonals.findById(id).populate(userPersonalsPopulatePaths).exec((err, user: IUserPersonals) => {
                if (err) return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);

                this.sendResponse({ success: true, user: user }, res);
            });
        });
    }

    /**
     * @swagger
     * /user/user-personals:
     *    patch:
     *      operationId: updateUserPersonals
     *      tags:
     *        - user
     *      description: This should update UserPersonals
     *      produces:
     *        - application/json
     *      consume:
     *        - application/json
     *      parameters:
     *        - in: header
     *          name: authorization
     *          type: string
     *          required: true
     *          description: JWT auth
     *        - in: body
     *          name: user
     *          required: true
     *          schema:
     *            type: object
     *            $ref: '#/definitions/UpsertUserPersonalsRequest'
     *      responses:
     *        200:
     *          description: base response if succeed with success on true
     *          schema:
     *            $ref: '#/definitions/UserPersonalsResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            $ref: '#/definitions/ErrorResponse'
     */
    public updateAction(router: Router): void {
        router.patch('/user-personals', this.guard, (req: Request, res: Response) => {
            const patchUser = req.body;

            if ('user' in patchUser) delete patchUser.user;

            UserPersonals.findById(patchUser._id, (err, user: IUserPersonals) => {
                if (err) return this.sendError(err, ErrorMessageConstants.WRONG_INPUT);
                if (!user) return this.sendError(err, ErrorMessageConstants.MODEL_NOT_FOUND);

                user.update({ _id: patchUser._id }, patchUser, (err, user: IUserPersonals) => {
                    if (err) return this.sendError(res, err);

                    this.sendResponse({ success: true, user: user }, res);
                });
            });
        });
    }

    /**
     * @swagger
     * /user/user-personals/{id}:
     *    delete:
     *      operationId: deleteUserPersonals
     *      tags:
     *        - user
     *      description: This should delete UserPersonals
     *      produces:
     *        - application/json
     *      parameters:
     *        - in: header
     *          name: authorization
     *          type: string
     *          required: true
     *          description: JWT auth
     *        - in: path
     *          name: id
     *          required: true
     *          type: string
     *          description: ID of UserPersonals
     *      responses:
     *        200:
     *          description: base response if succeed with success on true
     *          schema:
     *            $ref: '#/definitions/BaseResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            $ref: '#/definitions/ErrorResponse'
     *        403:
     *          description: user does not have permissions to delete UserPersonals
     *          schema:
     *            $ref: '#/definitions/BaseResponse'
     */
    public deleteAction(router: Router): void {
        router.delete('/user-personals/:id', this.guard, (req: Request, res: Response) => {
            const user = req.user;
            const userId = req.params.id;

            UserPersonals.deleteOne({ _id: userId }, (err) => {
                if (err) return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);

                this.sendResponse({ success: true }, res);
            });
        });
    }
}
