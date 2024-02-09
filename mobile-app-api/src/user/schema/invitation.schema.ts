import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';
import { IInvitation } from '../interface';

@Exclude()
@Schema({
    versionKey: false,
})
export class Invitation implements IInvitation {
    _id: Types.ObjectId;

    @Expose()
    id: string;

    @Expose()
    @Prop({ required: true })
    locationId: string;

    @Expose()
    @Prop({ required: true })
    locationName: string;

    @Expose()
    @Prop({ required: true })
    ownerUsername: string;

    @Expose()
    @Prop({ required: true })
    timestamp: Date;

    constructor(partial: Partial<Invitation>) {
        Object.assign(this, partial);
        this._id = new Types.ObjectId();
        this.id = this._id.toHexString();
    }
}