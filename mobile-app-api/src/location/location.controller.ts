import { Controller, Get, Param, Req, UseFilters } from '@nestjs/common';
import { Request } from 'express';
import { AxiosErrorFilter } from '../shared/filter';
import { JwtPayload } from '../auth/type';
import { LocationService } from './location.service';
import { GetLocationInsightsRes, ValidateSerialNumberRes } from './dto';

@Controller('location')
export class LocationController {
    constructor(private readonly service: LocationService) { }

    @Get('/validate/st-serial-number/:serialNumber')
    @UseFilters(new AxiosErrorFilter())
    async validateSTSerialNumber(@Req() request: Request, @Param('serialNumber') serialNumber: string): Promise<ValidateSerialNumberRes> {
        const payload = request.user as JwtPayload;
        return await this.service.validateSTSerialNumber(payload.sub, serialNumber);
    }

    @Get('/validate/ws-serial-number/:serialNumber')
    @UseFilters(new AxiosErrorFilter())
    async validateWSSerialNumber(@Param('serialNumber') serialNumber: string): Promise<ValidateSerialNumberRes> {
        return await this.service.validateWSSerialNumber(serialNumber);
    }

    @Get('/:locationUuid/insights')
    @UseFilters(new AxiosErrorFilter())
    async getInsights(@Param('locationUuid') locationUuid: string): Promise<GetLocationInsightsRes> {
        return await this.service.getInsights(locationUuid);
    }
}