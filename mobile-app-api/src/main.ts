import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter, MongoErrorFilter, ValidationExceptionFilter } from './shared/filter';
import { ValidationException } from './shared/exception';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('mobile-app-api/v1');

    app.useGlobalFilters(new MongoErrorFilter());
    app.useGlobalFilters(new ValidationExceptionFilter());
    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        exceptionFactory: (errors) => {
            return new ValidationException(errors);
        }
    }));

    await app.listen(3001);
}
bootstrap();

// TODO: rename endpoints using plurals
// TODO: error handling
// TODO: add logging
// TOD: fix capacity!!!!!!!!!
// TODO: order notifications by date when change to lookup