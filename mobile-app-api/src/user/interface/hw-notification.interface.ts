import { NotificationType } from '../../firebase/enum';
import { NotificationStatus } from '../enum';

export interface IHwNotification {
    id: string;
    notificationType: NotificationType;
    serialNumber: string;
    deviceType: string;
    importance: string;
    message: string;
    advice: string;
    timestamp: Date;
    status: NotificationStatus;
}