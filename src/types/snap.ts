export interface SnapPaymentResult {
  token: string;
  redirect_url: string;
}

// Based on https://docs.midtrans.com/reference/snap-js

/**
 * Represents the result object passed to Snap.js callbacks.
 * The exact structure might vary based on the specific callback and transaction status.
 * It's recommended to inspect the actual result object during development for precise typing.
 */
export interface SnapTransactionResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status: string;
  // Specific payment types might add more fields (e.g., va_numbers, permata_va_number)
  [key: string]: unknown;
}

export type SnapPaymentType =
  | 'credit_card'
  | 'cimb_clicks'
  | 'bca_klikbca'
  | 'bca_klikpay'
  | 'bri_epay'
  | 'telkomsel_cash'
  | 'echannel'
  | 'indosat_dompetku'
  | 'permata_va'
  | 'other_va'
  | 'bca_va'
  | 'bni_va'
  | 'kioson'
  | 'indomaret'
  | 'gci'
  | 'danamon_online';

export type SnapUIMode = 'deeplink' | 'qr' | 'auto';

export interface SnapOptions {
  /** Embed ID for Snap container (required for embed mode). */
  embedId?: string;
  /** Payment success callback (200 status_code) */
  onSuccess?: (result: SnapTransactionResult) => void;
  /** Payment pending callback (201 status_code) */
  onPending?: (result: SnapTransactionResult) => void;
  /** Payment error callback (4xx or 5xx status_code) */
  onError?: (result: SnapTransactionResult) => void;
  /** Called if customer has closed the payment popup prematurely without finishing the payment */
  onClose?: () => void;
  /** Sets the language ('en' or 'id'). Overrides MAP setting. Defaults to 'id' */
  language?: 'en' | 'id';
  /** Auto closes the last page of Indomaret and Bank Transfer payments after delay (seconds). 0 disables. Defaults to 0. */
  autoCloseDelay?: number;
  /** Skips order summary to directly select a specific payment type. */
  selectedPaymentType?: SnapPaymentType;
  /** Choose the UI mode for GoPay/ShopeePay ('deeplink', 'qr', 'auto'). Defaults to 'auto'. */
  uiMode?: SnapUIMode;
  /** List of payment types to be displayed. Filters enabled payments from backend integration. */
  enabledPayments?: SnapPaymentType[];
}

export interface SnapStatic {
  /**
   * Embeds the Snap payment interface into a specified container.
   * @param snapToken - The transaction token obtained from your backend.
   * @param options - Configuration options for the embedded Snap interface.
   */
  embed: (snapToken: string, options: SnapOptions & { embedId: string }) => void;

  /**
   * Opens the Snap payment interface as a popup.
   * @param snapToken - The transaction token obtained from your backend.
   * @param options - Configuration options for the Snap popup.
   */
  pay: (snapToken: string, options?: SnapOptions) => void;

  /**
   * Manually shows the Snap popup if it was previously hidden.
   */
  show: () => void;

  /**
   * Manually hides the Snap popup or embedded interface.
   */
  hide: () => void;
}

declare global {
  interface Window {
    snap?: SnapStatic;
  }
}
