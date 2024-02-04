import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthNotRequired } from '../shared/decorator';
import { JwtPayload } from '../auth/type';
import { AddLocationReq, LocationDto } from '../location/dto';
import { UserService } from './user.service';
import { UserDto, SendHwNotificationReq, UpdateHwNotificationStatusReq } from './dto';

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService) { }

    @Get()
    async fetchData(@Req() request: Request): Promise<UserDto> {
        const payload = request.user as JwtPayload;
        return await this.service.fetchData(payload.sub);
    }

    // TODO: rename to /locations
    @Post('/add-location')
    async addNewLocation(@Req() request: Request, @Body() locationData: AddLocationReq): Promise<LocationDto> {
        const payload = request.user as JwtPayload;
        return await this.service.addNewLocation(payload.sub, locationData);
    }

    // TODO: rename to /locations/:locationUuid
    @Post('/add-location/:locationUuid')
    async addExistingLocation(@Req() request: Request, @Param('locationUuid') locationUuid: string): Promise<LocationDto> {
        const payload = request.user as JwtPayload;
        return await this.service.addExistingLocation(payload.sub, locationUuid);
    }

    @Delete('/location/:locationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeLocation(@Req() request: Request, @Param('locationId') locationId: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.service.removeLocation(payload.sub, locationId);
    }

    // TODO: rename to /hw-notifications
    @AuthNotRequired()
    @Post('/send-hw-notification')
    async sendHwNotification(@Body() notificationData: SendHwNotificationReq): Promise<void> {
        return await this.service.sendHwNotification(notificationData);
    }

    @Patch('/hw-notification/:id')
    async updateHwNotificationStatus(@Req() request: Request, @Param('id') notificationId: string, @Body() updateData: UpdateHwNotificationStatusReq): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.service.updateHwNotificationStatus(payload.sub, notificationId, updateData);
    }

    @Delete('/hw-notification/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteHwNotification(@Req() request: Request, @Param('id') notificationId: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.service.deleteHwNotification(payload.sub, notificationId);
    }
}