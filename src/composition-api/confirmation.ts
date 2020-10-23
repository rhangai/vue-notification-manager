// eslint-disable-next-line import/no-extraneous-dependencies
import { InjectionKey, Ref, provide, inject, ref, reactive, nextTick } from "@vue/composition-api";
import { Confirmation } from "@rhangai/vue-notification-manager/lib/types";
import { ConfirmationBase, ConfirmationManager } from "../confirmation";

const CONFIRMATION_KEY: InjectionKey<ConfirmationManager> = "confirmation-manager" as any;

export type ConfirmationHandlerOptions = {
	delay?: number;
};

export type ConfirmationItem<C extends ConfirmationBase = Confirmation> = {
	id: number;
	active: boolean;
	confirmation: C;
	resolve: (value: boolean) => void;
};

export type UseConfirmationHandlerResult<C extends ConfirmationBase = Confirmation> = {
	confirmations: Ref<ConfirmationItem<C>[]>;
};

export function useConfirmationHandler<C extends ConfirmationBase = Confirmation>(
	options: ConfirmationHandlerOptions = {}
): UseConfirmationHandlerResult<C> {
	let idCounter = 0;

	const confirmations = ref<ConfirmationItem<C>[]>([]);
	const confirmationCallback = (confirmation: ConfirmationBase) => {
		return new Promise<boolean>((resolve) => {
			// eslint-disable-next-line no-plusplus
			const currentId = idCounter++;
			let item: ConfirmationItem<C>;
			let resolved: boolean = false;

			const removeConfirmation = () => {
				const index = confirmations.value.findIndex((c) => c.id === currentId);
				if (index >= 0) {
					confirmations.value.splice(index, 1);
				}
			};

			const resolveConfirmation = (value: boolean) => {
				if (resolved) return;
				resolved = true;
				resolve(!!value);
				item.active = false;
				setTimeout(removeConfirmation, options.delay ?? 0);
			};

			item = reactive({
				id: currentId,
				active: false,
				confirmation: confirmation as any,
				resolve: resolveConfirmation,
			});

			confirmations.value.push(item as any);
			nextTick(() => {
				item.active = true;
			});
		});
	};
	const confirmationManager = new ConfirmationManager<C>(confirmationCallback);
	confirmationManager.confirm = confirmationManager.confirm.bind(confirmationManager);
	provide(CONFIRMATION_KEY, confirmationManager);
	return {
		confirmations: confirmations as any,
	};
}

export type UseConfirmResult<C extends ConfirmationBase = Confirmation> = {
	confirm: (confirmationValue?: null | string | C) => Promise<boolean>;
};

export function useConfirm<C extends ConfirmationBase = Confirmation>(): UseConfirmResult<C> {
	const confirmationManager = inject(CONFIRMATION_KEY);
	if (!confirmationManager) throw new Error(`Confirmation manager not provided.`);
	return { confirm: confirmationManager.confirm };
}
