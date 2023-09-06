import Notification, { type NotificationLevel } from "../../types/Notification"

type Callback = (arg0: Notification) => void;

const callbacks: Callback[] = [];

function showNotification(title: string, text: string, level: NotificationLevel = 'info') {
    // if (level === 'info') {
    //     // For now, filter out info messages, because they tend to overwhelm the GUI.
    //     return;
    // }
    const notification = new Notification(title, text, level);
    callbacks.forEach(cb => cb(notification));
    return notification;
}

function registerCallback(callback: Callback) {
    callbacks.push(callback);
}

export default {
    showNotification,
    registerCallback,
}