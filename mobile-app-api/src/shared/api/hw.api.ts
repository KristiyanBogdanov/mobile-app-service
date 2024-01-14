import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HwApi {
    private readonly baseUrl: string;
    private readonly solarTracker = 'solar-tracker';
    private readonly weatherStation = 'weather-station';

    constructor(private readonly configService: ConfigService) {
        this.baseUrl = this.configService.get<string>('HW_API_URL');
    }
    
    private createApiEndpoint(apiPath: string): string {
        return `${this.baseUrl}/${apiPath}`;
    }

    validateSTSerialNumber(serialNumber: string): string {
        return this.createApiEndpoint(`${this.solarTracker}/validate/${serialNumber}`);
    }

    validateWSSerialNumber(serialNumber: string): string {
        return this.createApiEndpoint(`${this.weatherStation}/validate/${serialNumber}`);
    }

    getSTInsights(): string {
        return this.createApiEndpoint(`${this.solarTracker}/insights`);
    }

    getWSInsights(serialNumber: string): string {
        return this.createApiEndpoint(`${this.weatherStation}/${serialNumber}/insights`);
    }
}