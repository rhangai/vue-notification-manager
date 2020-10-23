// eslint-disable-next-line import/no-extraneous-dependencies
import { InjectionKey, provide, inject, ref, reactive, nextTick } from "@vue/composition-api";
import { Notification } from "@rhangai/vue-notification-manager/lib/types";
import { NotificationBase, NotificationManager } from "../notification";

const NOTIFICATION_KEY: InjectionKey<NotificationManager> = "notification-manager" as any;

export type NotificationHandlerOptions = {
	delay?: number;
};

export type NotificationItem<N extends NotificationBase = Notification> = {
	id: number;
	active: boolean;
	notification: N;
	resolve: () => void;
};

export function useNotificationHandler<N extends NotificationBase = Notification>(
	options: NotificationHandlerOptions = {}
) {
	let idCounter = 0;
	const notifications = ref<NotificationItem<N>[]>([]);
	const notificationCallback = (notification: NotificationBase) => {
		// eslint-disable-next-line no-plusplus
		const currentId = idCounter++;
		let item: NotificationItem<Notification>;
		let resolved: boolean = false;

		const removeNotification = () => {
			const index = notifications.value.findIndex((c) => c.id === currentId);
			if (index >= 0) {
				notifications.value.splice(index, 1);
			}
		};

		const resolveNotification = () => {
			if (resolved) return;
			resolved = true;
			item.active = false;
			setTimeout(removeNotification, options.delay ?? 0);
		};

		item = reactive({
			id: currentId,
			active: false,
			notification: notification as any,
			resolve: resolveNotification,
		});

		notifications.value.push(item as any);
		nextTick(() => {
			item.active = true;
		});
	};
	const notificationManager = new NotificationManager<N>(notificationCallback);
	notificationManager.notify = notificationManager.notify.bind(notificationManager);
	provide(NOTIFICATION_KEY, notificationManager);
	return {
		notify: notificationManager.notify,
		notifications,
	};
}

export function useNotify() {
	const notificationManager = inject(NOTIFICATION_KEY);
	if (!notificationManager)
		throw new Error(`Notification manager not provided. Try "useNotificationHandler()".`);
	return { notify: notificationManager.notify };
}
