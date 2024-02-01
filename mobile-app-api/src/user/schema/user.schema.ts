import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { IsEmail, IsStrongPassword, Length } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { STRONG_PASSWORD_OPTIONS, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../../shared/constants';
import { ErrorCode } from '../../shared/exception';
import { Location } from '../../location/schema';
import { IUser } from '../interface';
import { HwNotification } from './hw-notification.schema';

@Exclude()
@Schema({
    collection: 'users',
    versionKey: false
})
export class User implements IUser {
    @Expose()
    id: string;

    @Prop({ required: true })
    fcmTokens: string[];

    @Expose()
    @Length(
        USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, 
        { context: { errorCode: ErrorCode.InvalidUsernameLength } }
    )
    @Prop({ required: true })
    username: string;

    @Expose()
    @IsEmail()
    @Prop({
        index: {
            name: 'emailIndex',
            unique: true
        },
        required: true 
    })
    email: string;

    @IsStrongPassword(
        STRONG_PASSWORD_OPTIONS, 
        { context: { errorCode: ErrorCode.WeakPassword } }
    )
    @Prop({ required: true })
    password: string;

    @Expose()
    @Prop({
        type: [{ 
            type: MongooseSchema.Types.ObjectId, 
            ref: 'Location' 
        }],
        default: [], // TODO: check if this is needed
    })
    locations: Location[];

    @Expose()
    @Type(() => HwNotification)
    @Prop({
        type: [HwNotification],
        default: [],
    })
    hwNotifications: HwNotification[];

    @Expose()
    @Prop()
    refreshToken: string;

    constructor(user: Partial<User>) {
        Object.assign(this, user);
    }
}

export const UserSchema = SchemaFactory.createForClass(User);