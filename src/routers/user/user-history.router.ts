import { Router, Request, Response } from 'express';

import { BaseRoute } from '../BaseRoute';
import { UserHistory, IUserHistory, userHistoryPopulatePaths } from '../../models/user-history.model';
import { ErrorMessageConstants } from '../../classes/errorMessageConstants';
/**
 * @swagger
 *
 * definitions:
 *   UpsertUserHistory:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       editionsCompatibility:
 *         type: array
 *         description: edition compatibility ids
 *         items:
 *           type: string
 *       description:
 *         type: string
 *       system:
 *         type: string
 *         description: system id
 *       linkedTo:
 *         type: string
 *         description: system id
 *       controls:
 *         type: array
 *         items:
 *           ref: '#/definitions/CardControlUser'
 *       language:
 *         type: string
 *       createdBy:
 *          type: string
 *          description: user id.
 *   UserHistoryResponse:
 *     allOf:
 *     - ref: '#/definitions/BaseResponse'
 *     - type: object
 *     - required:
 *       - user
 *       properties:
 *         user:
 *           type: object
 *           ref: '#/definitions/UserHistory'
 *   GetUserHistorysResponse:
 *     allOf:
 *     - ref: '#/definitions/BaseResponse'
 *     - type: object
 *     - required:
 *       - users
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             ref: '#/definitions/UserHistory'
 *   GetAllUserHistorysResponse:
 *     allOf:
 *     - ref: '#/definitions/BaseResponse'
 *     - type: object
 *     - required:
 *       - users
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             ref: '#/definitions/UserHistory'
 *   UpsertUserHistoryRequest:
 *     type: object
 *     required:
 *     - user
 *     properties:
 *       user:
 *         type: object
 *         ref: '#/definitions/UpsertUserHistory'
 * tags:
 * - name: user
 */

export class UserHistoryRouter extends BaseRoute {
    /**
     * @swagger
     * /user/user-history:
     *    put:
     *      operationId: createUserHistory
     *      tags:
     *        - user
     *      description: This should add UserHistory
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
     *            ref: '#/definitions/UpsertUserHistoryRequest'
     *      responses:
     *        200:
     *          description: base response if succeed with success on true
     *          schema:
     *            ref: '#/definitions/UserHistoryResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            ref: '#/definitions/ErrorResponse'
     *
     */
    public addAction(router: Router): void {
        router.put('/user-history', this.guard, (req: Request, res: Response) => {
            const user = req.body.user;

            const newUser = UserHistory.hydrate(user);
            newUser.save((err, user: IUserHistory) => {
                if (err) return this.sendError(res, err, ErrorMessageConstants.WRONG_INPUT);

                this.sendResponse({ success: true, user: newUser }, res);
            });
        });
    }

    /**
     * @swagger
     * /user/user-history:
     *    get:
     *      operationId: getUserHistory
     *      tags:
     *        - user
     *      description: This should return UserHistory with specified {id} param,
     *      produces:
     *        - application/json
     *      parameters:
     *        - in: header
     *          name: authorization
     *          type: string
     *          required: true
     *          description: JWT auth
     *      responses:
     *        200:
     *          description: base response if succeed with success on true
     *          schema:
     *            ref: '#/definitions/GetAllUserHistorysResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            ref: '#/definitions/ErrorResponse'
     */
    public getAction(router: Router): void {
        router.get('/user-history', this.guard, (req: Request, res: Response) => {
            const userId = req.user._id;
            UserHistory.find({ user: userId }).populate(userHistoryPopulatePaths).exec((err, user: IUserHistory[]) => {
                if (err) return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);

                this.sendResponse({ success: true, users: user }, res);
            });
        });
    }

    /**
     * @swagger
     * /user/user-history:
     *    patch:
     *      operationId: updateUserHistory
     *      tags:
     *        - user
     *      description: This should update UserHistory
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
     *            ref: '#/definitions/UpsertUserHistoryRequest'
     *      responses:
     *        200:
     *          description: base response if succeed with success on true
     *          schema:
     *            ref: '#/definitions/UserHistoryResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            ref: '#/definitions/ErrorResponse'
     */
    public updateAction(router: Router): void {
        router.patch('/user-history', this.guard, (req: Request, res: Response) => {
            const patchUser = req.body.user;

            UserHistory.findById(patchUser._id, (err, user: IUserHistory) => {
                if (err) return this.sendError(err, ErrorMessageConstants.WRONG_INPUT);

                user.update({ _id: patchUser._id }, patchUser, (err, user: IUserHistory) => {
                    if (err) return this.sendError(res, err);

                    this.sendResponse({ success: true, user: user }, res);
                });
            });
        });
    }

    /**
     * @swagger
     * /user/user-history/{id}:
     *    delete:
     *      operationId: deleteUserHistory
     *      tags:
     *        - user
     *      description: This should delete UserHistory
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
     *          description: ID of UserHistory
     *      responses:
     *        200:
     *          description: base response if succeed with success on true
     *          schema:
     *            ref: '#/definitions/BaseResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            ref: '#/definitions/ErrorResponse'
     *        403:
     *          description: user does not have permissions to delete UserHistory
     *          schema:
     *            ref: '#/definitions/BaseResponse'
     */
    public deleteAction(router: Router): void {
        router.delete('/user-history/:id', this.guard, (req: Request, res: Response) => {
            const user = req.user;
            const userId = req.params.id;

            // UserHistory.canDelete(userId, user._id, (err, canDelete) => {
            //     if (err) return this.sendError(res, err, ErrorMessageConstants.WRONG_INPUT);

            //     if (canDelete) {
            //         UserHistory.deleteOne({ _id: userId }, (err) => {
            //             if (err) return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);

            //             this.sendResponse({ success: true }, res);
            //         });
            //     } else {
            //         this.sendNotAuthorized(res);
            //     }
            // });
        });
    }
}
