import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseFilters } from '@nestjs/common';
import { Request } from 'express';
import { AxiosErrorFilter } from '../shared/filter';
import { User } from '../user/schema';
import { LocationService } from './location.service';
import { AddLocationReq, LocationDto, ValidateSerialNumberRes } from './dto';

@Controller('location')
export class LocationController {
    constructor(private readonly service: LocationService) { }

    @Get('/validate/st-serial-number/:serialNumber')
    @UseFilters(new AxiosErrorFilter())
    async validateSTSerialNumber(@Req() request: Request, @Param('serialNumber') serialNumber: string): Promise<ValidateSerialNumberRes> {
        const user = request.user as User;
        return await this.service.validateSTSerialNumber(user.uuid, serialNumber);
    }

    @Get('/validate/ws-serial-number/:serialNumber')
    @UseFilters(new AxiosErrorFilter())
    async validateWSSerialNumber(@Param('serialNumber') serialNumber: string): Promise<ValidateSerialNumberRes> {
        return await this.service.validateWSSerialNumber(serialNumber);
    }

    @Post()
    async add(@Req() request: Request, @Body() locationData: AddLocationReq): Promise<LocationDto> {
        const user = request.user as User;
        return await this.service.add(user.uuid, locationData);
    }
}