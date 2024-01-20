import { Body, Controller, Param, Patch } from '@nestjs/common';
import { HwNotificationService } from './hw-notification.service';
import { UpdateHwNotificationStatusReq } from './dto';

@Controller('hw-notification')
export class HwNotificationController {
    constructor(private readonly service: HwNotificationService) { }

    @Patch('/:id/mark-as-seen')
    async markAsSeen(@Param('id') notificationId: string, @Body() updateData: UpdateHwNotificationStatusReq): Promise<void> {
        return await this.service.markAsSeen(notificationId, updateData);
    }
}

// TODO: think about which is better - import user service in hw-notification or import hw-notification service in user service