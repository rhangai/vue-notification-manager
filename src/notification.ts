export type NotificationBase = {
	message?: string;
	[key: string]: any;
};

type NotificationCallback = (notification: NotificationBase) => void;

export class NotificationManager<Notification extends NotificationBase = NotificationBase> {
	constructor(private readonly notificationCallback: NotificationCallback) {}

	notify(notificationValue: string | Notification) {
		if (!this.notificationCallback) return true;
		let notification: NotificationBase;
		if (typeof notificationValue === "string") {
			notification = { message: notificationValue };
		} else {
			notification = notificationValue;
		}
		return this.notificationCallback(notification);
	}
}
