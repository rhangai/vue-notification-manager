import { Confirmation } from "@rhangai/vue-notification-manager/lib/types";

export type ConfirmationBase = {
	message?: string | null;
	[key: string]: any;
};
type ConfirmationCallback = (confirmation: ConfirmationBase) => Promise<boolean> | boolean;

export class ConfirmationManager<C extends ConfirmationBase = Confirmation> {
	constructor(private readonly confirmationCallback: ConfirmationCallback) {}

	async confirm(confirmationValue?: null | string | C): Promise<boolean> {
		if (!this.confirmationCallback) return true;
		let confirmation: ConfirmationBase;
		if (typeof confirmationValue === "string") {
			confirmation = { message: confirmationValue };
		} else if (confirmationValue == null) {
			confirmation = { message: null };
		} else {
			confirmation = confirmationValue;
		}
		return this.confirmationCallback(confirmation);
	}
}
