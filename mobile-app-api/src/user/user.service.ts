import { Injectable } from '@nestjs/common';
import { Document } from 'mongoose';
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

    async findByEmail(email: string): Promise<User & Document> {
        return await this.userRepository.findOne({ email });
    }

    async findByUuid(uuid: string): Promise<User & Document> {
        return await this.userRepository.findOne({ uuid });
    }

    async addLocation(userUuid: string, locationUuid: string) {
        await this.userRepository.updateOne(
            { uuid: userUuid },
            { $addToSet: { locations: locationUuid } }
        )
    }
}