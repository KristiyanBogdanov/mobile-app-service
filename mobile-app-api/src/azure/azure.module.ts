import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';
import { AzureService } from './azure.service';

@Module({
    providers: [
        {
            provide: 'AzureBlobServiceClient',
            useFactory: (configService: ConfigService) => {
                const connectionString = configService.get<string>('AZURE_BLOB_STORAGE_CONNECTION_STRING');
                return BlobServiceClient.fromConnectionString(connectionString);
            },
            inject: [ConfigService]
        },
        AzureService
    ],
    exports: [AzureService],
})
export class AzureModule { }