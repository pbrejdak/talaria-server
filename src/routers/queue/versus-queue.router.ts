import { Router, Request, Response } from 'express';

import { BaseRoute } from '../BaseRoute';
import { VersusQueue, IVersusQueue, versusQueuePopulatePaths } from '../../classes/models/queue/versus-queue.model';
import { ErrorMessageConstants } from '../../classes/errorMessageConstants';
import { VersusQueueService } from '../../classes/queue/services/versus-queue.service';
import { SignUpVersusRequest } from '../../classes/contracts/signUpVersusRequest';
/**
 * @swagger
 *
 * definitions:
 *   SignUpVersusQueue:
 *     type: object
 *     properties:
 *       activityType:
 *         type: number
 *         description: activityType enum
 *       environmentType:
 *         type: number
 *         description: environmentType enum
 *       distance:
 *         type: number
 *         description: distance in kilometres
 *   SignUpVersusQueueResponse:
 *     allOf:
 *     - ref: '#/definitions/BaseResponse'
 *     - type: object
 *     - required:
 *       - versus
 *       properties:
 *         url:
 *           type: string
 *         clientId:
 *           type: string
 *   GetVersusQueuesResponse:
 *     allOf:
 *     - ref: '#/definitions/BaseResponse'
 *     - type: object
 *     - required:
 *       - versus
 *       properties:
 *         versus:
 *           type: array
 *           items:
 *             ref: '#/definitions/VersusQueue'
 *   SignUpVersusQueueRequest:
 *     type: object
 *     required:
 *     - versus
 *     properties:
 *       versus:
 *         type: object
 *         ref: '#/definitions/SignUpVersusQueue'
 * tags:
 * - name: queue
 */

export class VersusQueueRouter extends BaseRoute {
    /**
     * @swagger
     * /queue/versus/signUp:
     *    post:
     *      operationId: signUp
     *      tags:
     *        - queue
     *      description: This should sign up for queue
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
     *          name: versus
     *          required: true
     *          schema:
     *            type: object
     *            ref: '#/definitions/SignUpVersusQueueRequest'
     *      responses:
     *        200:
     *          description: base response if succeed with success on true
     *          schema:
     *            ref: '#/definitions/SignUpVersusQueueResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            ref: '#/definitions/ErrorResponse'
     *
     */
    public addAction(router: Router): void {
        router.post('/signUp', this.guard, (req: Request, res: Response) => {
            const versus: SignUpVersusRequest = req.body.versus;

            if (VersusQueueService.instance) {
                VersusQueueService.createInstance();
            }

            VersusQueueService.instance.addToQueue(req.user, versus)
                .then(response => {
                    this.sendResponse(response, res, 200);
                });
        });
    }

    /**
     * @swagger
     * /queue/versus/signOut:
     *    delete:
     *      operationId: deleteVersusQueue
     *      tags:
     *        - queue
     *      description: This should delete VersusQueue
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
     *          description: ID of VersusQueue
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
     *          description: user does not have permissions to delete VersusQueue
     *          schema:
     *            ref: '#/definitions/BaseResponse'
     */
    public deleteAction(router: Router): void {
        router.delete('/signOut', this.guard, (req: Request, res: Response) => {
            const user = req.user;
            const versusId = req.params.id;

            // VersusQueue.canDelete(versusId, user._id, (err, canDelete) => {
            //     if (err) return this.sendError(res, err, ErrorMessageConstants.WRONG_INPUT);

            //     if (canDelete) {
            //         VersusQueue.deleteOne({ _id: versusId }, (err) => {
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
