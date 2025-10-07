import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { CurrencyService } from '../services/currency-service.js';
export declare const listCurrenciesCatalogTool: Tool;
export interface CurrencyInfo {
    name: string;
    min_amount: number;
    max_amount: number | null;
    image: string;
    original_symbol: string;
    original_blockchain: string;
    requires_memo: boolean;
    decimals: number;
    is_active: boolean;
    features: string[];
}
export declare class ListCurrenciesCatalogHandler {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    handle(args: unknown): Promise<{
        currencies: CurrencyInfo[];
        total_count: number;
        filtered_count: number;
        filter_applied: boolean;
        filter_amount?: number;
        network_groups?: Record<string, string[]>;
        cache_info: {
            cached: boolean;
            age: number;
            valid: boolean;
        };
    }>;
    /**
     * Get feature list for a currency
     * Uses original_symbol and original_blockchain for user-friendly features
     */
    private getCurrencyFeatures;
    /**
     * Group currencies by base symbol to identify multi-network variants
     * Example: USDC_ETH, USDC_TRON, USDC_POLYGON -> { "USDC": ["USDC_ETH", "USDC_TRON", "USDC_POLYGON"] }
     */
    private groupCurrenciesByNetwork;
    /**
     * Check if currency is a stablecoin
     */
    private isStablecoin;
    /**
     * Check if currency is in the popular list
     */
    private isPopularCurrency;
}
export declare function listCurrenciesCatalogHandler(currencyService: CurrencyService): ListCurrenciesCatalogHandler;
//# sourceMappingURL=list-currencies-catalog.d.ts.map