import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Document } from 'mongoose';
import { ErrorCode, createHttpExceptionBody } from '../shared/exception';
import { UserRepository } from './repository';
import { User } from './schema';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async create(user: User): Promise<User & Document> {
        return await this.userRepository.create(user);
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ email });
    }

    async findByUuid(uuid: string): Promise<User> {
        return await this.userRepository.findOne({ uuid });
    }

    async addLocation(userUuid: string, locationUuid: string) {
        const result = await this.userRepository.addLocation(userUuid, locationUuid);

        if (result === 0) {
            throw new InternalServerErrorException(
                createHttpExceptionBody(ErrorCode.FailedToAddLocation, 'Failed to add location to user')
            );
        }
    }
}