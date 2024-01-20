import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { IHwNotification } from '../interface';
import { NotificationStatus } from '../enum';

@Exclude()
@Schema({
    collection: 'hw-notifications',
    versionKey: false,
})
export class HwNotification implements IHwNotification {
    @Transform(({ value }) => value.toString())
    _id: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    notificationType: string;

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
    @IsDateString()
    @Prop({ required: true })
    timestamp: Date;

    @Expose()
    @Prop({
        type: String,
        enum: NotificationStatus,
        required: true,
    })
    status: NotificationStatus;

    constructor(hwNotification: Partial<HwNotification>) {
        Object.assign(this, hwNotification);
        this.status = NotificationStatus.Active;
    }
}

export const HwNotificationSchema = SchemaFactory.createForClass(HwNotification);