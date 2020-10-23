export type ConfirmationBase = {
	message?: string;
	[key: string]: any;
};

type ConfirmationCallback = (confirmation: ConfirmationBase) => Promise<boolean> | boolean;

export class ConfirmationManager<Confirmation extends ConfirmationBase = ConfirmationBase> {
	constructor(private readonly confirmationCallback: ConfirmationCallback) {}

	async confirm(confirmationValue: string | Confirmation): Promise<boolean> {
		if (!this.confirmationCallback) return true;
		let confirmation: ConfirmationBase;
		if (typeof confirmationValue === "string") {
			confirmation = { message: confirmationValue };
		} else {
			confirmation = confirmationValue;
		}
		return this.confirmationCallback(confirmation);
	}
}
