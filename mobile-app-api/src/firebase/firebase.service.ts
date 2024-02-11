import { Inject, Injectable, Logger } from '@nestjs/common';
import { app } from 'firebase-admin';
import { Message, Notification } from 'firebase-admin/lib/messaging/messaging-api';
import { FirebaseNotificationData } from './type';

@Injectable()
export class FirebaseService {
    constructor(
        @Inject('Firebase') private readonly firebase: app.App,
        private readonly logger: Logger
    ) { }

    async sendPushNotification(fcmToken: string, data: FirebaseNotificationData, notification?: Notification): Promise<string> {
        const message: Message = {
            token: fcmToken,
            notification: notification,
            data: {
                'notificationType': data.notificationType,
                'body': JSON.stringify(data.body),
            },
        };

        try {
            return await this.firebase.messaging().send(message);
        } catch (error) {
            this.logger.error(error);
        }
    }
}