export type NotificationLevel = 'error' | 'info' | 'success' | 'warning';

export default class Notification {
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
