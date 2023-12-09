import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MongoErrorFilter } from './shared/filter';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('mobile-app-api/v1');

    app.useGlobalFilters(new MongoErrorFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.listen(3001);
}
bootstrap();