import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseFilters } from '@nestjs/common';
import { Request } from 'express';
import { AxiosErrorFilter } from '../shared/filter';
import { JwtPayload } from '../auth/type';
import { LocationService } from './location.service';
import { GetLocationInsightsRes, GetLocationLimitsRes, ValidateSerialNumberRes, WeatherStationInsightsDto } from './dto';

@Controller('location')
export class LocationController {
    constructor(private readonly service: LocationService) { }

    @Get('/limits')
    getLimits(): GetLocationLimitsRes {
        return this.service.getLimits();
    }
    
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

    @Get('/:locationId/insights')
    @UseFilters(new AxiosErrorFilter())
    async getInsights(@Param('locationId') locationId: string): Promise<GetLocationInsightsRes> {
        return await this.service.getInsights(locationId);
    }

    @Get('/insights/weather-stations/:wsSerialNumber')
    @UseFilters(new AxiosErrorFilter())
    async getWeatherStationInsights(@Param('wsSerialNumber') wsSerialNumber: string): Promise<WeatherStationInsightsDto> {
        return await this.service.getWeatherStationInsights(wsSerialNumber);
    }

    @Post('/:locationId/weather-stations/:wsSerialNumber')
    @UseFilters(new AxiosErrorFilter())
    async addWeatherStation(@Req() request: Request, @Param('locationId') locationId: string, @Param('wsSerialNumber') wsSerialNumber: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.service.addWeatherStation(payload.sub, locationId, wsSerialNumber);
    }

    // TODO: rename to weather-station
    @Delete('/:locationId/weather-stations')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeWeatherStation(@Req() request: Request, @Param('locationId') locationId: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.service.removeWeatherStation(payload.sub, locationId);
    }
}