import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ValidateMongoId implements PipeTransform<string> {
    transform(value: string, metadata: ArgumentMetadata): string {
        if (isValidObjectId(value)) {
            return value;
        } else {
            throw new BadRequestException();
        }
    };
}