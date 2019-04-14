import { Router, Request, Response } from 'express';

import { BaseRoute } from '../BaseRoute';
import { VersusQueueService } from '../../services/queue/versus-queue.service';
import { SignUpVersusRequest } from '../../classes/contracts/signUpVersusRequest';
/**
 * @swagger
 *
 * definitions:
 *   SignUpVersusQueueRequest:
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
     *          type: SignUpVersusQueueRequest
     *          schema:
     *            type: object
     *            $ref: '#/definitions/SignUpVersusQueueRequest'
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
    public signUpAction(router: Router): void {
        router.post('/signUp', this.guard, (req: Request, res: Response) => {
            const versus: SignUpVersusRequest = req.body;

            if (!VersusQueueService.instance) {
                VersusQueueService.createInstance();
            }

            VersusQueueService.instance.addToQueue(req.user, versus)
                .then(response => {
                    this.sendResponse({ path: response }, res, 200);
                });
        });
    }
}
