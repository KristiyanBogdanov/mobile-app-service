import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { NotificationType } from '../../firebase/enum';
import { IHwNotification } from '../interface';

@Exclude()
@Schema({
    versionKey: false,
})
export class HwNotification implements IHwNotification {
    private _id: Types.ObjectId;

    @Expose()
    id: string;

    @Expose()
    @Prop({ 
        type: String, 
        enum: NotificationType, 
        required: true 
    })
    notificationType: NotificationType;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    serialNumber: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    deviceType: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    importance: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    message: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    advice: string;

    @Expose()
    @IsDateString()
    @Prop({ required: true })
    timestamp: Date;

    constructor(hwNotification: Partial<HwNotification>) {
        Object.assign(this, hwNotification);
        this._id = new Types.ObjectId();
        this.id = this._id.toHexString();
    }
}