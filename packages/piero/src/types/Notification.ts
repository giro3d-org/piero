export type NotificationLevel = 'info' | 'warning' | 'error' | 'success';

export default class Notification {
    public readonly title: string;
    public readonly text: string;
    public readonly level: NotificationLevel;

    public constructor(title: string, text: string, level: NotificationLevel = 'info') {
        this.title = title;
        this.text = text;
        this.level = level;
    }

    public static empty(): Notification {
        return new Notification('', '', 'info');
    }
}
