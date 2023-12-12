import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoErrorFilter implements ExceptionFilter {
    catch(error: MongoError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const mongoErrorResponse = (status: HttpStatus) => {
            response.status(status).json({
                error: error.name,
                code: error.code,
                message: error.message
            });
        };

        switch (error.code) {
            case 11000:
                mongoErrorResponse(HttpStatus.CONFLICT);
                break;
            default:
                mongoErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR);
                break;
        }
    }
}	