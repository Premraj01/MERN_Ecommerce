export class Payment {
	constructor(
		public data: Data,
		public tokenx: Tokenx,
		public isAuth: boolean,
		public processingOptions: ProcessingOptions,
	) {
		data.currency = "USD";
	}
}

export interface Data {
	currency: string;
	customer: CustomerRef;
	paymentMethod: string;
	amount: number;
}
export interface Tokenx {
	token: string;
}

export interface CustomerRef {
	customerRef: string;
}
export interface ProcessingOptions {
	checkFraud?: boolean;
	shouldUseFingerprint?: boolean;
	retryOnSoftDecline?: boolean;
	verboseResponse?: boolean;
}

// Recurring Payment

export interface Schedule {
	interval: string;
	intervalCount: number;
	balance?: number;
}
