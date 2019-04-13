/**
 * user router
 */
import * as express from 'express';
import { Auth } from './auth.router';
import { UserPersonalsRouter } from './user-personals.router';

const user = express.Router();
// normal router
user.use('/auth', new Auth().getRoutes());
// CRUD router
user.use('/', new UserPersonalsRouter().getRoutes());

export default user;
