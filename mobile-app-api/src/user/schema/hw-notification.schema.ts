import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { NotificationType } from '../../firebase/enum';
import { IHwNotification } from '../interface';
import { NotificationStatus } from '../enum';

@Exclude()
@Schema({
    versionKey: false,
})
export class HwNotification implements IHwNotification {
    _id: Types.ObjectId;

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

    @Expose()
    @IsEnum(NotificationStatus)
    @Prop({
        type: String,
        enum: NotificationStatus,
        required: true,
    })
    status: NotificationStatus;

    constructor(hwNotification: Partial<HwNotification>) {
        Object.assign(this, hwNotification);
        this._id = new Types.ObjectId();
        this.id = this._id.toHexString();
        this.status = NotificationStatus.Active;
    }
}