class CoordinatesDto {
    longitude: number;
    latitude: number;
}

class AverageSensorValueDto {
    id: string;
    average: number;
}

export class SolarTrackerInsightsDto {
    installationDate: string;
    sensorsStatus: {
        irradianceSensor: boolean;
        accelerometer: boolean;
        azimuthMotor: boolean;
        elevationMotor: boolean;
    };
    capacity: number;
    isActive: boolean;
    lastUpdate: string;
    coordinates: CoordinatesDto;
    currentAzimuth: number;
    currentElevation: number;
    azimuthDeviation: number;
    elevationDeviation: number;
    last24hAvgIrradiance: AverageSensorValueDto;
}

export class WeatherStationInsightsDto {
    installationDate: string;
    sensorsStatus: {
        anemometer: boolean;
        temperatureSensor: boolean;
    };
    isActive: boolean;
    lastUpdate: string;
    coordinates: CoordinatesDto;
    currentTemperature: number;
    currentWindSpeed: number;
    currentWindDirection: number;
    last24hAvgTemperature: AverageSensorValueDto;
    last24hAvgWindSpeed: AverageSensorValueDto;
}

export class SolarTrackersInsightsHwApiRes {
    data: SolarTrackerInsightsDto[];
}

export class WeatherStationInsightsHwApiRes extends WeatherStationInsightsDto { }

export class GetLocationInsightsRes {
    solarTrackers: SolarTrackerInsightsDto[];
    weatherStation: WeatherStationInsightsDto;
}

// TODO: add validation