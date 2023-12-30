import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../auth/type';
import { AddLocationReq, LocationDto } from '../location/dto';
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
}