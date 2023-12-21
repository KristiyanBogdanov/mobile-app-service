import { ConfigService } from '@nestjs/config';

class HwApiUtil {
    private static readonly baseUrl = new ConfigService().get<string>('HW_API_URL');

    static createApiEndpoint(apiPath: string): string {
        return `${this.baseUrl}/${apiPath}`;
    }
}

export namespace HwApi {
    export namespace SolarTracker {
        const solarTracker = 'solar-tracker';
        
        export function validateSerialNumber(serialNumber: string): string {
            return HwApiUtil.createApiEndpoint(`${solarTracker}/validate/${serialNumber}`);
        }
    }

    export namespace WeatherStation {
        const weatherStation = 'weather-station';

        export function validateSerialNumber(serialNumber: string): string {
            return HwApiUtil.createApiEndpoint(`${weatherStation}/validate/${serialNumber}`);
        }
    }
}