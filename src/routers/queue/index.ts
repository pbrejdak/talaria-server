/**
 * queue router
 */
import * as express from 'express';
import { VersusQueueRouter } from './versus-queue.router';

const queue = express.Router();
// normal router
queue.use('/versus', new VersusQueueRouter().getRoutes());

export default queue;
