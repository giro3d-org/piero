export type NotificationLevel = "info" | "warning" | "error"

export default class Notification {
    readonly title: string;
    readonly text: string;
    readonly level: NotificationLevel;

    constructor(title: string, text: string, level: NotificationLevel) {
        this.title = title;
        this.text = text;
        this.level = level;
    }

    static empty() {
        return new Notification('', '', 'info');
    }
}