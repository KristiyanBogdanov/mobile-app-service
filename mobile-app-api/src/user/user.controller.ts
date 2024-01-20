import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthNotRequired } from '../shared/decorator';
import { JwtPayload } from '../auth/type';
import { AddLocationReq, LocationDto } from '../location/dto';
import { SendHwNotificationReq } from '../hw-notification/dto';
import { UserService } from './user.service';
import { UserDto } from './dto';

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService) { }

    @Get()
    async fetchData(@Req() request: Request): Promise<UserDto> {
        const payload = request.user as JwtPayload;
        return await this.service.fetchData(payload.sub);
    }

    @Post('/add-location')
    async addNewLocation(@Req() request: Request, @Body() locationData: AddLocationReq): Promise<LocationDto> {
        const payload = request.user as JwtPayload;
        return await this.service.addNewLocation(payload.sub, locationData);
    }

    @Post('/add-location/:locationUuid')
    async addExistingLocation(@Req() request: Request, @Param('locationUuid') locationUuid: string): Promise<LocationDto> {
        const payload = request.user as JwtPayload;
        return await this.service.addExistingLocation(payload.sub, locationUuid);
    }

    @AuthNotRequired()
    @Post('/send-hw-notification')
    async sendHwNotification(@Body() notificationData: SendHwNotificationReq): Promise<void> {
        return await this.service.sendHwNotification(notificationData);
    }
}