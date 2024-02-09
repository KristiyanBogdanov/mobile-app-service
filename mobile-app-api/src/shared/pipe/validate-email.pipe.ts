import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isEmail } from 'class-validator';

@Injectable()
export class ValidateEmail implements PipeTransform<string> {
    transform(value: string, metadata: ArgumentMetadata): string {
        if (isEmail(value)) {
            return value;
        } else {
            throw new BadRequestException();
        }
    };
}