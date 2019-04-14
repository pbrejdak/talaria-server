/**
 * user router
 */
import * as express from 'express';
import { Auth } from './auth.router';
import { UserPersonalsRouter } from './user-personals.router';
import { UserHistoryRouter } from './user-history.router';

const user = express.Router();
// normal router
user.use('/auth', new Auth().getRoutes());
// CRUD router
user.use('/', new UserPersonalsRouter().getRoutes());
user.use('/', new UserHistoryRouter().getRoutes());

export default user;
