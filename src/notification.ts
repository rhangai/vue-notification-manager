import { Notification } from "@rhangai/vue-notification-manager/lib/types";

export type NotificationBase = {
	message?: string;
	[key: string]: any;
};

type NotificationCallback = (notification: NotificationBase) => void;

export class NotificationManager<N extends NotificationBase = Notification> {
	constructor(private readonly notificationCallback: NotificationCallback) {}

	notify(notificationValue: string | N) {
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
