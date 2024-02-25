import { Inject, Injectable } from '@nestjs/common';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AzureService {
    constructor(@Inject('AzureBlobServiceClient') private readonly blobServiceClient: BlobServiceClient) { }

    private getBlobClient(containerName: string, fileName: string): BlockBlobClient {
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        return containerClient.getBlockBlobClient(fileName);
    }
    
    async uploadFile(containerName: string, file: Express.Multer.File): Promise<string> {
        const extension = file.originalname.split('.').pop(); 
        const fileName = uuid() + '.' + extension; 

        const blockBlobClient = this.getBlobClient(containerName, fileName);
        await blockBlobClient.uploadData(file.buffer);

        return blockBlobClient.url;
    }

    private getFileNameFromUrl(fileUrl: string): string {
        const urlParts = fileUrl.split('/');
        return urlParts[urlParts.length - 1];
    }

    async deleteFile(containerName: string, fileUrl: string): Promise<void> {
        const fileName = this.getFileNameFromUrl(fileUrl);
        const blockBlobClient = this.getBlobClient(containerName, fileName);
        await blockBlobClient.deleteIfExists();
    }
}