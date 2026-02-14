import type { NotificationStore } from '@/stores/notifications';
import type Notification from '@/types/Notification';

export class NotificationApiImpl implements NotificationApi {
    public constructor(private readonly store: NotificationStore) {}

    public pushNotification(notification: Notification): void {
        this.store.push(notification);
    }
}

/**
 * Provides access to the notification system.
 */
export default interface NotificationApi {
    /**
     * Pushes a notification to the user.
     * @param notification - The notification.
     */
    pushNotification(notification: Notification): void;
}
