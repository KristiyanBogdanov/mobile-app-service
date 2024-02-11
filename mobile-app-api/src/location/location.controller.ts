import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseFilters } from '@nestjs/common';
import { Request } from 'express';
import { AxiosErrorFilter } from '../shared/filter';
import { ValidateMongoId } from '../shared/pipe';
import { JwtPayload } from '../auth/type';
import { LocationService } from './location.service';
import { 
    GetLocationLimitsRes, LocationDto, ValidateSTSerialNumberRes, ValidateWSSerialNumberRes,
    GetLocationInsightsRes, SolarTrackerInsightsDto, WeatherStationInsightsDto 
} from './dto';

@Controller('locations')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    @Get('/limits')
    getLimits(): GetLocationLimitsRes {
        return this.locationService.getLimits();
    }

    @Get('/:locationId')
    async getLocation(@Req() request: Request, @Param('locationId', ValidateMongoId) locationId: string): Promise<LocationDto> {
        const payload = request.user as JwtPayload;
        return this.locationService.getLocation(payload.id, locationId);
    }
    
    @Get('/validate/st-serial-number/:serialNumber')
    @UseFilters(new AxiosErrorFilter())
    async validateSTSerialNumber(@Req() request: Request, @Param('serialNumber') serialNumber: string): Promise<ValidateSTSerialNumberRes> {
        const payload = request.user as JwtPayload;
        return await this.locationService.validateSTSerialNumber(payload.id, serialNumber);
    }

    @Get('/validate/ws-serial-number/:serialNumber')
    @UseFilters(new AxiosErrorFilter())
    async validateWSSerialNumber(@Param('serialNumber') serialNumber: string): Promise<ValidateWSSerialNumberRes> {
        return await this.locationService.validateWSSerialNumber(serialNumber);
    }

    @Get('/:locationId/insights')
    @UseFilters(new AxiosErrorFilter())
    async getInsights(@Param('locationId', ValidateMongoId) locationId: string): Promise<GetLocationInsightsRes> {
        return await this.locationService.getInsights(locationId);
    }

    @Get('/:locationId/insights/weather-station')
    @UseFilters(new AxiosErrorFilter())
    async getWeatherStationInsights(@Param('locationId', ValidateMongoId) locationId: string): Promise<WeatherStationInsightsDto> {
        return await this.locationService.getWeatherStationInsights(locationId);
    }

    @Post('/:locationId/weather-station/:wsSerialNumber')
    @UseFilters(new AxiosErrorFilter())
    async addWeatherStation(@Req() request: Request, @Param('locationId', ValidateMongoId) locationId: string, @Param('wsSerialNumber') wsSerialNumber: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.locationService.addWeatherStation(payload.id, payload.fcmToken, locationId, wsSerialNumber);
    }

    @Delete('/:locationId/weather-station')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeWeatherStation(@Req() request: Request, @Param('locationId', ValidateMongoId) locationId: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.locationService.removeWeatherStation(payload.id, payload.fcmToken, locationId);
    }

    @Get('/:locationId/insights/solar-trackers/:stSerialNumber')
    @UseFilters(new AxiosErrorFilter())
    async getSolarTrackersInsights(@Param('locationId', ValidateMongoId) locationId: string, @Param('stSerialNumber') stSerialNumber: string): Promise<SolarTrackerInsightsDto> {
        return await this.locationService.getSolarTrackersInsights(locationId, stSerialNumber);
    }

    @Post('/:locationId/solar-trackers/:stSerialNumber')
    @UseFilters(new AxiosErrorFilter())
    async addSolarTracker(@Req() request: Request, @Param('locationId', ValidateMongoId) locationId: string, @Param('stSerialNumber') stSerialNumber: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.locationService.addSolarTracker(payload.id, payload.fcmToken, locationId, stSerialNumber);
    }

    @Delete('/:locationId/solar-trackers/:stSerialNumber')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeSolarTracker(@Req() request: Request, @Param('locationId', ValidateMongoId) locationId: string, @Param('stSerialNumber') stSerialNumber: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.locationService.removeSolarTracker(payload.id, payload.fcmToken, locationId, stSerialNumber);
    }
}