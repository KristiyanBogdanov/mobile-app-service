import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose } from 'class-transformer';
import { IUser } from '../interface';

@Exclude()
@Schema({
    collection: 'users',
})
export class User implements IUser {
    @Expose()
    @Prop({
        index: {
            name: 'uuidIndex',
            unique: true
        },
        required: true,
    })
    uuid: string;

    @Expose()
    @Prop({ required: true })
    username: string;

    @Expose()
    @Prop({
        index: {
            name: 'emailIndex',
            unique: true
        },
        required: true 
    })
    email: string;

    @Expose()
    @Prop({ required: true })
    password: string;

    @Expose()
    @Prop({ default: [] })
    locations: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);