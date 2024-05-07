import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthNotRequired } from '../shared/decorator';
import { ValidateMongoId } from '../shared/pipe';
import { JwtPayload } from '../auth/type';
import { AddLocationReq, LocationDto } from '../location/dto';
import { UserService } from './user.service';
import { UserDto, SendHwNotificationReq, SendInvitationReq, RespondToInvitationReq } from './dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async fetchData(@Req() request: Request): Promise<UserDto> {
        const payload = request.user as JwtPayload;
        return await this.userService.fetchData(payload.id);
    }

    @Post('/locations')
    async addNewLocation(@Req() request: Request, @Body() locationData: AddLocationReq): Promise<LocationDto> {
        const payload = request.user as JwtPayload;
        return await this.userService.addNewLocation(payload.id, payload.fcmToken, locationData);
    }

    @Delete('/locations/:locationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeLocation(@Req() request: Request, @Param('locationId', ValidateMongoId) locationId: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.userService.removeLocation(payload.id, payload.fcmToken, locationId);
    }

    @Post('/invitations')
    async inviteUserToLocation(@Req() request: Request, @Body() invitationData: SendInvitationReq): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.userService.inviteUserToLocation(payload.id, invitationData);
    }

    @Delete('/invitations/:invitationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async respondToInvitation(@Req() request: Request, @Param('invitationId', ValidateMongoId) invitationId: string, @Body() responseData: RespondToInvitationReq): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.userService.respondToInvitation(payload.id, payload.fcmToken, invitationId, responseData);
    }

    @Delete('/locations/:locationId/users/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeUserFromLocation(@Req() request: Request, @Param('locationId', ValidateMongoId) locationId: string, @Param('userId', ValidateMongoId) userId: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.userService.removeUserFromLocation(payload.id, payload.fcmToken, locationId, userId);
    }

    @AuthNotRequired()
    @Post('/hw-notifications/inactive-devices')
    async sendInactiveDevicesHwNotification(@Body() notificationData: SendHwNotificationReq): Promise<void> {
        return await this.userService.sendInactiveDevicesNotification(notificationData);
    }

    @AuthNotRequired()
    @Post('/hw-notifications/device-state-reports')
    async sendDeviceStateReportHwNotification(@Body() notificationData: SendHwNotificationReq): Promise<void> {
        return await this.userService.sendDeviceStateReportNotification(notificationData);
    }

    @Delete('/hw-notifications/:hwNotificationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteHwNotification(@Req() request: Request, @Param('hwNotificationId', ValidateMongoId) hwNotificationId: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.userService.deleteHwNotification(payload.id, payload.fcmToken, hwNotificationId);
    }
}