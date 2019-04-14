/**
 * application main router
 */
import * as express from 'express';

import { default as userRouter } from './user';
import queueRouter from './queue';

const api = express.Router();

api.use('/user', userRouter);
api.use('/queue', queueRouter);

export default api;
