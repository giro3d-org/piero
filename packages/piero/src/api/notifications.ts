import type { NotificationStore } from '@/stores/notifications';

export interface Notification {
    level: NotificationLevel;
    text: string;
    title: string;
}

/**
 * Provides access to the notification system.
 */
export interface NotificationApi {
    /**
     * Pushes an error notification to the user.
     * @param title - The notification title.
     * @param message - The optional notification message.
     */
    error(title: string, message?: string): void;

    /**
     * Pushes a info notification to the user.
     * @param title - The notification title.
     * @param message - The optional notification message.
     */
    info(title: string, message?: string): void;

    /**
     * Pushes a notification to the user.
     * @param notification - The notification.
     */
    push(notification: Notification): void;

    /**
     * Pushes a success notification to the user.
     * @param title - The notification title.
     * @param message - The optional notification message.
     */
    success(title: string, message?: string): void;

    /**
     * Pushes a warning notification to the user.
     * @param title - The notification title.
     * @param message - The optional notification message.
     */
    warning(title: string, message?: string): void;
}

export type NotificationLevel = 'error' | 'info' | 'success' | 'warning';

/** @internal */
export class NotificationApiImpl implements NotificationApi {
    public constructor(private readonly store: NotificationStore) {}

    public error(title: string, message?: string): void {
        this.push({
            level: 'error',
            text: message ?? '',
            title,
        });
    }

    public info(title: string, message?: string): void {
        this.push({
            level: 'info',
            text: message ?? '',
            title,
        });
    }

    public push(notification: Notification): void {
        this.store.push(notification);
    }

    public success(title: string, message?: string): void {
        this.push({
            level: 'success',
            text: message ?? '',
            title,
        });
    }

    public warning(title: string, message?: string): void {
        this.push({
            level: 'warning',
            text: message ?? '',
            title,
        });
    }
}
