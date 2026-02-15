import type { NotificationStore } from '@/stores/notifications';

/**
 * Provides access to the notification system.
 */
export interface NotificationApi {
    /**
     * Pushes a notification to the user.
     * @param notification - The notification.
     */
    pushNotification(notification: Notification): void;
}

export type NotificationLevel = 'error' | 'info' | 'success' | 'warning';

export class Notification {
    public readonly level: NotificationLevel;
    public readonly text: string;
    public readonly title: string;

    public constructor(title: string, text: string, level: NotificationLevel = 'info') {
        this.title = title;
        this.text = text;
        this.level = level;
    }

    public static empty(): Notification {
        return new Notification('', '', 'info');
    }
}

/** @internal */
export class NotificationApiImpl implements NotificationApi {
    public constructor(private readonly store: NotificationStore) {}

    public pushNotification(notification: Notification): void {
        this.store.push(notification);
    }
}
