import { NotificationType } from '../enum';

export type FirebaseNotificationData = {
    notificationType: NotificationType;
    body: Object;
};