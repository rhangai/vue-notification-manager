// eslint-disable-next-line import/no-extraneous-dependencies
import { InjectionKey, provide, inject, ref, reactive, nextTick } from "@vue/composition-api";
import { ConfirmationBase, ConfirmationManager } from "../confirmation";

const CONFIRMATION_KEY: InjectionKey<ConfirmationManager> = "confirmation-manager" as any;

export type ConfirmationHandlerOptions = {
	delay?: number;
};

export type ConfirmationItem<Confirmation extends ConfirmationBase = ConfirmationBase> = {
	id: number;
	active: boolean;
	confirmation: Confirmation;
	resolve: (value: boolean) => void;
};

export function useConfirmationHandler<Confirmation extends ConfirmationBase = ConfirmationBase>(
	options: ConfirmationHandlerOptions = {}
) {
	let idCounter = 0;

	const confirmations = ref<ConfirmationItem<Confirmation>[]>([]);
	const confirmationCallback = (confirmation: ConfirmationBase) => {
		return new Promise<boolean>((resolve) => {
			// eslint-disable-next-line no-plusplus
			const currentId = idCounter++;
			let item: ConfirmationItem<Confirmation>;
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
	const confirmationManager = new ConfirmationManager<Confirmation>(confirmationCallback);
	confirmationManager.confirm = confirmationManager.confirm.bind(confirmationManager);
	provide(CONFIRMATION_KEY, confirmationManager);
	return {
		confirmations,
	};
}

export function useConfirm() {
	const confirmationManager = inject(CONFIRMATION_KEY);
	if (!confirmationManager) throw new Error(`Confirmation manager not provided.`);
	return { confirm: confirmationManager.confirm };
}
