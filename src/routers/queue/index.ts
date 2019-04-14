/**
 * queue router
 */
import * as express from 'express';
import { VersusQueueRouter } from './versus-queue.router';

const queueRouter = express.Router();
// normal router
queueRouter.use('/versus', new VersusQueueRouter().getRoutes());

export default queueRouter;
