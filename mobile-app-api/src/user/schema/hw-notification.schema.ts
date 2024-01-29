import { Prop, Schema } from '@nestjs/mongoose';
import { Exclude, Expose } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IHwNotification } from '../interface';
import { NotificationStatus } from '../enum';

@Exclude()
@Schema({
    versionKey: false,
})
export class HwNotification implements IHwNotification {
    @Expose()
    id: string;

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
    @IsEnum(NotificationStatus)
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