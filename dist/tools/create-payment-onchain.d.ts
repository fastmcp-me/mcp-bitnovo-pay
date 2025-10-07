import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { PaymentService } from '../services/payment-service.js';
import type { CurrencyService } from '../services/currency-service.js';
import type { QrCodeData } from '../types/index.js';
export declare const createPaymentOnchainTool: Tool;
export declare class CreatePaymentOnchainHandler {
    private readonly paymentService;
    private readonly currencyService;
    constructor(paymentService: PaymentService, currencyService: CurrencyService);
    handle(args: unknown): Promise<{
        identifier: string;
        address?: string;
        payment_uri?: string;
        expected_input_amount?: number;
        rate?: number;
        input_currency?: string;
        original_symbol?: string;
        original_blockchain?: string;
        tag_memo?: string;
        qr_address?: QrCodeData;
        qr_payment_uri?: QrCodeData;
        expires_at?: string;
        expires_in_minutes?: number;
        expiration_warning?: string;
    }>;
    /**
     * Extract tag/memo from payment URI for currencies that require it
     */
    private extractTagMemo;
}
export declare function createPaymentOnchainHandler(paymentService: PaymentService, currencyService: CurrencyService): CreatePaymentOnchainHandler;
//# sourceMappingURL=create-payment-onchain.d.ts.map