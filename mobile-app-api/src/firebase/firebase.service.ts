import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { app } from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseService {
    constructor(@Inject('Firebase') private readonly firebase: app.App) { }

    async sendPushNotification(fcmToken: string, title: string, body: string): Promise<string> {
        const message: Message = {
            token: fcmToken,
            notification: {
                title,
                body
            }
        };

        try {
            return await this.firebase.messaging().send(message);
        } catch (error) {
            console.error(error);
        }
    }
}