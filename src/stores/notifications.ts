import { defineStore } from 'pinia';
import Notification from '@/types/Notification';

export const useNotificationStore = defineStore('notifications', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function push(notification: Notification) {
        // Nothing to store.
        // We rely on automatic event by Pinia to notify listener about the notification.
    }

    return { push };
});
