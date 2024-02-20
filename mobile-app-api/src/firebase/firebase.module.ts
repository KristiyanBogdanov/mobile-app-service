import { Logger, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';

@Module({
    providers: [
        {
            provide: 'Firebase',
            useFactory: async () => {
                const serviceAccount = require('../../firebase-adminsdk.json');
                return admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            }
        },
        FirebaseService,
        Logger
    ],
    exports: [FirebaseService]
})
export class FirebaseModule { }