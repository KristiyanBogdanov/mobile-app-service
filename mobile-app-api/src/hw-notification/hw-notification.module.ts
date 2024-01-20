import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HwNotification, HwNotificationSchema } from './schema';
import { HwNotificationController } from './hw-notification.controller';
import { HwNotificationService } from './hw-notification.service';
import { HwNotificationRepository } from './repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: HwNotification.name, schema: HwNotificationSchema },
        ])
    ],
    controllers: [HwNotificationController],
    providers: [
        HwNotificationService,
        HwNotificationRepository
    ],
    exports: [HwNotificationService]
})
export class HwNotificationModule { }