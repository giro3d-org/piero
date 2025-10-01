import type { NotificationStore } from '@/stores/notifications';
import type Notification from '@/types/Notification';

export class NotificationApiImpl implements NotificationApi {
    public constructor(private readonly store: NotificationStore) {}

    public pushNotification(notification: Notification): void {
        this.store.push(notification);
    }
}

export default interface NotificationApi {
    pushNotification(notification: Notification): void;
}
