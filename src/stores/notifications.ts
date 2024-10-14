import type Notification from '@/types/Notification';
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notifications', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function push(notification: Notification) {
        // Nothing to store.
        // We rely on automatic event by Pinia to notify listener about the notification.
    }

    return { push };
});
