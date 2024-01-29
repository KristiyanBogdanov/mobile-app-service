import { NotificationStatus } from '../enum';

export interface IHwNotification {
    id: string;
    notificationType: string;
    serialNumber: string;
    deviceType: string;
    importance: string;
    message: string;
    timestamp: Date;
    status: NotificationStatus;
}