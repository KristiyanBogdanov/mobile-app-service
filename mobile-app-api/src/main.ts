import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { HttpExceptionFilter, MongoErrorFilter } from './shared/filter';
import { ErrorCode, HttpExceptionRecord, createHttpExceptionBodyList, createHttpExceptionRecord } from './shared/exception';
import { AppModule } from './app.module';

function mapValidationError(error: ValidationError): HttpExceptionRecord {
    const constraint = Object.keys(error.constraints)[0];
    const message = error.constraints[constraint];
    let code = ErrorCode.GenericBadRequest;

    if (error.contexts && error.contexts[constraint]) {
        code = error.contexts[constraint].errorCode
    }

    return createHttpExceptionRecord(code, message);
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('mobile-app-api/v1');

    app.useGlobalFilters(new MongoErrorFilter());
    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        exceptionFactory: (errors) => {
            const exceptionBody = errors.map(mapValidationError);
            return new BadRequestException(createHttpExceptionBodyList(exceptionBody));
        }
    }));

    await app.listen(3001);
}
bootstrap();