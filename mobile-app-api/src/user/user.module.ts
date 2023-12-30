import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationModule } from '../location/location.module';
import { User, UserSchema } from './schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        LocationModule
    ],
    controllers: [UserController],
    providers: [
        UserService,
        UserRepository
    ],
    exports: [UserService]
})
export class UserModule { }