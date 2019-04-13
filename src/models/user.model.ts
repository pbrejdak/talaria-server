import { Schema, Model, Document, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { RoleEnum } from '../classes/enums/role.enum';
import { mongooseObjectId } from '../Constants';

/**
 * @swagger
 *
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *       role:
 *         type: number
 *         description: role enum
 *       indexable:
 *          type: boolean
 *       isActive:
 *          type: boolean
 *       reputation:
 *          type: number
 */
export const userName = "User";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: RoleEnum;
    indexable: boolean;
    isActive: boolean;
    reputation: number;
}

export interface IUserModel {
    createUser(user: IUser, callback: Function): void;
    comparePassword(candidatePassword: string, hash: string, callback: Function): void;
    checkPrivilage(userId: number, callback: Function): void;
    getUser(id: string, callback: (err, user: IUser) => void): void;
    getUsers(callback: Function);
    changeActiveState(userId: string, state: boolean, byRole: RoleEnum, callback: (err, user: IUser) => void);
    changeRole(userId: string, role: RoleEnum, byRole: RoleEnum, callback: (err, user: IUser) => void);
    getHashedPassword(password: string, callback: (err, hashedPassword: string) => void);
}

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: Number,
        default: RoleEnum.USER
    },
    indexable: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    reputation: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
});

userSchema.static('createUser', (user: Partial<IUser>, callback: (err: any, product: IUser) => void) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) { throw err; }
            user.password = hash;
            user.save(callback);
        });
    });
});

userSchema.static('getHashedPassword', (password: string, callback: (err, hashedPassword: string) => void) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) { callback(err, null); }
            callback(null, hash);
        });
    });
});

userSchema.static('comparePassword', (candidatePassword: string, hash: string, callback: Function) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) { throw err; }
        callback(null, isMatch);
    });
});


userSchema.static('checkPrivilage', (user_id: number, callback: Function) => {
    User.findOne({ _id: user_id }, (err, user) => {
        if (err) { throw err; }
        callback(null, user.role);
    });
});

userSchema.static('getUser', (userId: string, callback: Function) => {
    return User.findById(userId, 'firstName lastName _id role', callback);
});

userSchema.static('getUsers', (callback: Function) => {
    User.find({ indexable: true }, callback);
});

userSchema.static('changeActiveState', (userId: string, state: boolean, byRole: RoleEnum, callback: (err, user: IUser) => void) => {
    User.findById(userId, (err, user) => {
        if (err) { return callback(err, null); }
        // TODO: implement
    });
});

userSchema.static('changeRole', (userId: string, role: RoleEnum, byRole: RoleEnum, callback: (err, user: IUser) => void) => {
    User.findById(userId, (err, user) => {
        if (err) { return callback(err, null); }

        // TODO: implement security
        user.role = role;
        user.save(callback);
    });
});

export type UserModel = Model<IUser> & IUserModel & IUser;

export const User: UserModel = <UserModel>model<IUser>(userName, userSchema);
