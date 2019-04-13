import * as jwt from 'jsonwebtoken';
import { Router, Request, Response } from 'express';

import { User, IUser } from '../../models/user.model';
import { BaseRoute } from '../BaseRoute';
import { TokenExpiration } from '../../Constants';
import Constants from '../../Constants';
import { UserRegisterRequest } from '../../classes/contracts/userRegisterRequest';
import { ResetPassword, IResetPassword } from '../../models/reset-password.model';
import { ErrorMessageConstants, combineErr } from '../../classes/errorMessageConstants';
import { IAuthToken } from '../../classes/models/user/authToken';
import { UserPersonals } from '../../models/user-personals.model';
import { UserProfileResponse } from '../../classes/contracts/userProfileResponse';

/**
 * @swagger
 *
 * tags:
 * - name: authentication
 *   description: Basic operation on authorizing
 *
 * definitions:
 *   UserRegisterRequest:
 *     type: object
 *     required:
 *       - email
 *       - password
 *       - name
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 *       name:
 *         type: string
 */

export class Auth extends BaseRoute {
    private getTokenData(user: IUser) {
        const tokenData: IAuthToken = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        return tokenData;
    }

    /**
     * @swagger
     * /user/auth/login:
     *    post:
     *      operationId: login
     *      tags:
     *        - "authentication"
     *      description: This should return TokenResponse
     *      produces:
     *        - application/json
     *      consume:
     *        - application/json
     *      parameters:
     *        - in: body
     *          name: LoginRequest
     *          schema:
     *            type: object
     *            properties:
     *              email:
     *                type: string
     *              password:
     *                type: string
     *      responses:
     *        200:
     *          description: token response
     *          schema:
     *            $ref: '#/definitions/TokenResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            type: object
     *            $ref: '#/definitions/ErrorResponse'
     */
    public loginAction(router: Router): void {
        router.post('/login', (req: Request, res: Response) => {
            const { email, password } = req.body;

            if (!Constants.EmailRegExp.test(email) || !password) {
                return this.sendError(res, null, combineErr(
                    ErrorMessageConstants.EMAIL_INCORRECT,
                    ErrorMessageConstants.PASSWORD_INCORRECT
                ));
            }

            User.findOne({ email: email }, userTokenProps).select('password').exec((err, user) => {
                if (err) return this.sendError(res, err, ErrorMessageConstants.FIND_BY_EMAIL);
                if (!user) return this.sendError(res, null, ErrorMessageConstants.FIND_BY_EMAIL);

                User.comparePassword(req.body.password, user.password, (err, isMatch) => {
                    if (err) return this.sendError(res, err, ErrorMessageConstants.LOGIN_ERROR);
                    if (!isMatch) return this.sendError(res, null, ErrorMessageConstants.LOGIN_FAILED);

                    const tokenData: IAuthToken = this.getTokenData(user);
                    const token = jwt.sign(tokenData, process.env.APPLICATION_SECRET, {
                        expiresIn: TokenExpiration.WEEK
                    });

                    this.sendResponse({
                        success: true,
                        token: token,
                    }, res);
                });
            });
        });
    }

    /**
     * @swagger
     * /user/auth/register:
     *    post:
     *      operationId: register
     *      tags:
     *        - "authentication"
     *      description: This should return TokenResponse
     *      produces:
     *        - application/json
     *      consume:
     *        - application/json
     *      parameters:
     *        - name: user
     *          in: body
     *          required: true
     *          type: UserRegisterRequest
     *          schema:
     *            $ref: '#/definitions/UserRegisterRequest'
     *      responses:
     *        200:
     *          description: token response
     *          schema:
     *            $ref: '#/definitions/TokenResponse'
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            type: object
     *            $ref: '#/definitions/ErrorResponse'
     */
    public registerAction(router: Router): void {
        router.post('/register', (req: Request, res: Response) => {
            const userReq: UserRegisterRequest = req.body;

            if (!userReq.name || !Constants.EmailRegExp.test(userReq.email) || !userReq.password || userReq.password.length < 6) {
                return this.sendError(res, null, ErrorMessageConstants.WRONG_INPUT);
            }

            User.findOne({ email: userReq.email }, (err, existingUser) => {
                if (err) return this.sendError(res, err, ErrorMessageConstants.FIND_BY_EMAIL);
                if (existingUser) return this.sendError(res, err, ErrorMessageConstants.USER_EXIST);

                // creationIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress
                const user = new User({
                    email: userReq.email,
                    password: userReq.password,
                    name: userReq.name,
                });

                User.createUser(user, (err, user) => {
                    if (err) return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);
                    const tokenData: IAuthToken = this.getTokenData(user);

                    res.status(200);
                    this.sendResponse({
                        success: true,
                        message: 'user created.',
                        token: jwt.sign(tokenData, process.env.APPLICATION_SECRET, {
                            expiresIn: TokenExpiration.WEEK
                        })
                    }, res);
                });
            });
        });
    }

    /**
     * @swagger
     * /user/auth/get-profile:
     *    get:
     *      operationId: getUserProfile
     *      tags:
     *        - "authentication"
     *      description: required header with token
     *      authorization:
     *        - name: token
     *          description: standard token
     *      parameters:
     *        - in: header
     *          name: authorization
     *          type: string
     *          required: true
     *          description: JWT auth
     *      produces:
     *        - application/json
     *      responses:
     *        200:
     *          description: returns user
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            type: object
     *            $ref: '#/definitions/ErrorResponse'
     */
    public profileAction(router: Router): void {
        router.get('/get-profile', this.guard, (req: Request, res: Response) => {
            const user: IAuthToken = req.user;

            const promises = [];
            promises.push(
                UserPersonals.findOne({ user: user._id }).exec()
            );

            Promise.all(promises)
                .then(data => {
                    const [personals] = data;
                    const response: UserProfileResponse = {
                        personals: personals,
                    };

                    this.sendResponse(response, res);
                })
                .catch(err => {
                    this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);
                });
        });
    }

    /**
     * @swagger
     * /user/auth/change-password:
     *    post:
     *      operationId: changePassword
     *      tags:
     *        - "authentication"
     *      description: required header with token
     *      authorization:
     *        - name: token
     *          description: standard token
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
     *          name: ChangePasswordRequest
     *          schema:
     *            type: object
     *            properties:
     *              currentPassword:
     *                type: string
     *              newPassword:
     *                type: string
     *              newPasswordConf:
     *                type: string
     *      responses:
     *        200:
     *          description: return success
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            type: object
     *            $ref: '#/definitions/ErrorResponse'
     */
    public changePasswordAction(router: Router) {
        router.post('/change-password', this.guard, (req: Request, res: Response) => {
            const userId = req.user._id;
            const { currentPassword, newPassword, newPasswordConf } = req.body;

            if (newPassword !== newPasswordConf) return this.sendError(res, null, ErrorMessageConstants.NEW_PASSWORD_NOT_MATCH);

            User.findById(userId).select('password').exec((err, user) => {
                if (err) return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);

                User.comparePassword(currentPassword, user.password, (err, match) => {
                    if (err) return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);
                    if (!match) return this.sendError(res, null, ErrorMessageConstants.PASSWORD_NOT_MATCH);

                    User.getHashedPassword(newPassword, (err, hashedPassword) => {
                        if (err) { return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR); }
                        user.password = hashedPassword;
                        user.save((err, user) => {
                            if (err) return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);

                            return this.sendResponse({ success: true }, res);
                        });
                    });
                });

            });
        });
    }

    /**
     * @swagger
     * /user/auth/reset-password:
     *    post:
     *      operationId: resetPassword
     *      tags:
     *        - "authentication"
     *      description: required header with token
     *      authorization:
     *        - name: token
     *          description: standard token
     *      produces:
     *        - application/json
     *      consume:
     *        - application/json
     *      parameters:
     *        - in: body
     *          name: ResetPasswordRequest
     *          schema:
     *            type: object
     *            properties:
     *              email:
     *                type: string
     *      responses:
     *        200:
     *          description: return success and send email to user email address
     *        400:
     *          description: something went wrong with request body
     *          schema:
     *            type: object
     *            $ref: '#/definitions/ErrorResponse'
     */
    public resetPasswordAction(router: Router): void {
        router.post('/reset-password', (req: Request, res: Response) => {
            const email = req.body.email;

            ResetPassword.generateToken(email, (err, resetPassword: IResetPassword, user: IUser) => {
                if (err) return this.sendError(res, err, ErrorMessageConstants.UNKOWN_ERROR);

                // send mail
            });
        });
    }
}

const userTokenProps = "_id name email role password";
