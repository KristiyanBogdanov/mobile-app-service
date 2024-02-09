import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthNotRequired } from '../shared/decorator';
import { JwtPayload } from '../auth/type';
import { AddLocationReq, LocationDto } from '../location/dto';
import { UserService } from './user.service';
import { UserDto, SendHwNotificationReq, UpdateHwNotificationStatusReq, HwNotificationDto, SendInvitationReq, RespondToInvitationReq } from './dto';
import { IsEmail } from 'class-validator';
import { ValidateEmail } from '../shared/pipe';

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService) { }

    @Get()
    async fetchData(@Req() request: Request): Promise<UserDto> {
        const payload = request.user as JwtPayload;
        return await this.service.fetchData(payload.id);
    }

    // TODO: rename to /locations
    @Post('/add-location')
    async addNewLocation(@Req() request: Request, @Body() locationData: AddLocationReq): Promise<LocationDto> {
        const payload = request.user as JwtPayload;
        return await this.service.addNewLocation(payload.id, payload.fcmToken, locationData);
    }

    @Post('/invitations')
    async inviteUserToLocation(@Req() request: Request, @Body() invitationData: SendInvitationReq): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.service.inviteUserToLocation(payload.id, invitationData);
    }

    @Delete('/invitations/:invitationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async respondToInvitation(@Req() request: Request, @Param('invitationId') invitationId: string, @Body() responseData: RespondToInvitationReq): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.service.respondToInvitation(payload.id, payload.fcmToken, invitationId, responseData);
    }

    // TODO: add remove user from location

    @Delete('/location/:locationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeLocation(@Req() request: Request, @Param('locationId') locationId: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.service.removeLocation(payload.id, payload.fcmToken, locationId);
    }

    // TODO: rename to /hw-notifications
    @AuthNotRequired()
    @Post('/notifications/hw/inactive-devices')
    async sendInactiveDevicesHwNotification(@Body() notificationData: SendHwNotificationReq): Promise<void> {
        return await this.service.sendInactiveDevicesNotification(notificationData);
    }

    @AuthNotRequired()
    @Post('/notifications/hw/device-state-report')
    async sendDeviceStateReportHwNotification(@Body() notificationData: SendHwNotificationReq): Promise<void> {
        return await this.service.sendDeviceStateReportNotification(notificationData);
    }

    @Patch('/hw-notification/:id')
    async updateHwNotificationStatus(@Req() request: Request, @Param('id') notificationId: string, @Body() updateData: UpdateHwNotificationStatusReq): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.service.updateHwNotificationStatus(payload.id, notificationId, updateData);
    }

    @Delete('/hw-notification/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteHwNotification(@Req() request: Request, @Param('id') notificationId: string): Promise<void> {
        console.log('notificationId', notificationId);
        const payload = request.user as JwtPayload;
        return await this.service.deleteHwNotification(payload.id, notificationId);
    }
}