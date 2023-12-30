import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoErrorFilter implements ExceptionFilter {
    catch(error: MongoError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: {
                type: error.name,
                mongoCode: error.code,
                message: error.message,
            }
        });
    }
}	