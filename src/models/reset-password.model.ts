import { Document, Schema, Model, model, Types } from 'mongoose';
import { IUser, User, userName } from './user.model';
import { TokenExpiration, mongooseObjectId } from '../Constants';
import { newGuid } from '../classes/Helper';


export interface IResetPassword extends Document {
    token: string;
    exp: Date;
    user: IUser;
}

export interface IResetPasswordModel {
    generateToken(email: string, callback: (err, resetInfo: IResetPassword, user: IUser) => void);
    validateToken(token: string, callback: (err, isValid: boolean) => void): void;
}

const resetPasswordSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    exp: {
        type: Date,
        default: new Date(new Date().getTime() + TokenExpiration.HOUR),
    },
    user: {
        type: mongooseObjectId,
        required: true,
        ref: userName
    }
});

resetPasswordSchema.static('generateToken',
    (email: string, callback: (err, resetInfo: IResetPassword, user: IUser) => void) => {
        User.findOne({ email: email }, (err, user: IUser) => {
            if (err) {
                return callback(err, null, null);
            }

            const reset = new ResetPassword({
                token: newGuid(),
                user: user._id
            });

            reset.save((err, resetPassword: IResetPassword) => (err, data) => callback.call(this, err, data, user));
        });
    });

export type ResetPassword = Model<IResetPassword> & IResetPasswordModel & IResetPassword;
export const ResetPassword: ResetPassword = <ResetPassword>model<IResetPassword>('ResetPassword', resetPasswordSchema);
