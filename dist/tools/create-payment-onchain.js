// MCP tool for creating on-chain cryptocurrency payments
import { getLogger } from '../utils/logger.js';
import { generateOptimizedQrCode, } from '../utils/image-utils.js';
import { getQrCache } from '../utils/qr-cache.js';
const logger = getLogger();
export const createPaymentOnchainTool = {
    name: 'create_payment_onchain',
    description: '🚨 CRITICAL RULE #1 - EXPIRATION: YOU MUST tell user payment expires in EXACTLY "expires_in_minutes" MINUTES. Convert "expires_at" (UTC) to user\'s LOCAL TIME ZONE and display in their language. Format: "expires in X minutes (on [date] at [time] [user\'s timezone])".\n\n' +
        '💰 CRITICAL RULE #2 - AMOUNT: YOU MUST show "expected_input_amount" with FULL PRECISION (all decimals). Example: "0.43515861 SOL" not "0.44 SOL". This is the EXACT amount customer must send.\n\n' +
        '🪙 RULE #3 - DISPLAY: Show users ONLY "original_symbol" (BTC, USDC, SOL) and "original_blockchain" (Bitcoin Network, Solana Test Network). NEVER mention internal codes.\n\n' +
        '🔗 CRITICAL RULE #4 - PAYMENT LINK: ALWAYS display "web_url" as "Enlace de pago:" or "Payment Link:" in user\'s language. This is the web gateway URL where customers can view and complete the payment.\n\n' +
        '🎯 WHEN TO USE: Only when user explicitly mentions a cryptocurrency (Bitcoin, BTC, Ethereum, ETH, USDC, Solana, SOL, etc.). Customer MUST pay with that exact crypto.\n\n' +
        '🌐 NETWORK SELECTION: If crypto has MULTIPLE networks (check network_groups), call list_currencies_catalog first, ASK USER which network. Pass cryptocurrency as "SYMBOL on NETWORK".\n\n' +
        'EXAMPLES: cryptocurrency="BTC", cryptocurrency="USDC on Ethereum Network", cryptocurrency="SOL on Solana Test Network".',
    inputSchema: {
        type: 'object',
        properties: {
            amount: {
                type: 'number',
                minimum: 0.01,
                description: 'Payment amount in the specified fiat currency (must be positive). This amount will be converted to cryptocurrency at current rates.',
            },
            cryptocurrency: {
                type: 'string',
                description: 'Cryptocurrency with network (REQUIRED). Format: "SYMBOL on NETWORK" or just "SYMBOL" if only one network. Examples: "USDC on Ethereum Network", "USDC on Solana Test Network", "BTC" (if only one Bitcoin network exists). Use list_currencies_catalog to see available options. The customer MUST pay in this specific cryptocurrency.',
            },
            fiat: {
                type: 'string',
                pattern: '^[A-Z]{3}$',
                description: 'ISO 4217 currency code (EUR, USD, GBP, etc.). IMPORTANT: Use the EXACT currency the user specified. If user says "100 euros" use EUR. If user says "100 dollars" use USD. Default: EUR',
                default: 'EUR',
            },
            notes: {
                type: 'string',
                maxLength: 256,
                description: 'Optional payment description or reference',
            },
            include_qr: {
                type: 'boolean',
                default: true,
                description: 'If true, includes QR codes in the response (RECOMMENDED: always true for immediate use). If false, generate later with generate_payment_qr.',
            },
        },
        required: ['amount', 'cryptocurrency'],
        additionalProperties: false,
    },
};
export class CreatePaymentOnchainHandler {
    paymentService;
    currencyService;
    constructor(paymentService, currencyService) {
        this.paymentService = paymentService;
        this.currencyService = currencyService;
    }
    async handle(args) {
        const startTime = Date.now();
        logger.info('Processing create_payment_onchain request', {
            operation: 'create_payment_onchain',
            timestamp: new Date().toISOString(),
        });
        try {
            // Lookup internal currency code from user-friendly cryptocurrency string
            const requestArgs = args;
            const cryptoString = requestArgs.cryptocurrency;
            // Get all currencies to find the matching code
            const allCurrencies = await this.currencyService.getCurrenciesCatalog({});
            let matchedCurrency = null;
            for (const currency of allCurrencies.currencies) {
                const originalSymbol = currency.original_symbol || '';
                const originalBlockchain = currency.original_blockchain || '';
                const displayName = originalSymbol && originalBlockchain
                    ? `${originalSymbol} on ${originalBlockchain}`
                    : '';
                const displayNameShort = originalSymbol;
                // Skip currencies without proper symbol/blockchain info
                if (!originalSymbol) {
                    continue;
                }
                // Match either "USDC on Ethereum Network" or just "USDC" (if unique)
                // Safe toLowerCase with null checks
                if (cryptoString === displayName ||
                    cryptoString === displayNameShort ||
                    (cryptoString && displayName && cryptoString.toLowerCase() === displayName.toLowerCase()) ||
                    (cryptoString && displayNameShort && cryptoString.toLowerCase() === displayNameShort.toLowerCase())) {
                    matchedCurrency = currency;
                    break;
                }
            }
            if (!matchedCurrency) {
                throw new Error(`Cryptocurrency "${cryptoString}" not found. Use list_currencies_catalog to see available options.`);
            }
            // Create modified args with internal currency code for API
            // Map MCP parameter names to internal API names
            const argsObj = args;
            const { amount, ...restArgs } = argsObj;
            const apiArgs = {
                ...restArgs,
                amount_eur: amount, // Map 'amount' to internal 'amount_eur'
                input_currency: matchedCurrency.symbol, // Internal API code
            };
            // Create payment through service
            const payment = await this.paymentService.createOnchainPayment(apiArgs);
            // Get currency information for blockchain and image URL
            const currency = payment.currency
                ? await this.currencyService.findCurrency(payment.currency)
                : null;
            // Handle expiration - use backend value or default to 15 minutes
            let effectiveExpiresAt;
            if (payment.expiresAt) {
                effectiveExpiresAt = payment.expiresAt;
            }
            else {
                // Backend didn't provide expiration - use 15 minute default
                effectiveExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
                logger.warn('Backend did not provide expiration date, using 15min default', {
                    paymentId: payment.identifier,
                    defaultExpiration: effectiveExpiresAt.toISOString(),
                    operation: 'create_payment_onchain_default_expiration',
                });
            }
            // Calculate expiration time remaining (always present now, with 15min default)
            const now = new Date();
            const diffMs = effectiveExpiresAt.getTime() - now.getTime();
            const expiresInMinutes = Math.max(0, Math.floor(diffMs / 60000)); // Convert to minutes
            // Create formatted warning that LLM MUST display
            const expiresAtFormatted = effectiveExpiresAt.toISOString().replace('T', ' ').substring(0, 19) +
                ' UTC';
            // Expiration warning with key data - LLM will format in user's language
            const expirationWarning = `Payment expires in ${expiresInMinutes} minutes at ${expiresAtFormatted}`;
            // Extract user-facing symbols with explicit types to satisfy ESLint
            const originalSymbol = currency
                ? currency.original_symbol
                : undefined;
            const originalBlockchain = currency
                ? currency.original_blockchain
                : undefined;
            const response = {
                identifier: payment.identifier,
                web_url: payment.webUrl, // Web URL if provided by backend
                address: payment.address,
                payment_uri: payment.paymentUri,
                expected_input_amount: payment.expectedInputAmount,
                input_currency: payment.currency, // Internal symbol for API calls
                original_symbol: originalSymbol, // User-facing symbol (e.g., BTC, USDC)
                original_blockchain: originalBlockchain, // User-facing blockchain name (e.g., Bitcoin Network)
                blockchain: currency?.blockchain, // Internal blockchain identifier
                // Extract tag/memo from payment URI or address for currencies that require it
                tag_memo: this.extractTagMemo(payment.paymentUri, payment.currency),
                expires_at: effectiveExpiresAt.toISOString(), // Always present (backend or 15min default)
                expires_in_minutes: expiresInMinutes,
                expiration_warning: expirationWarning,
            };
            // Generate QR codes if requested
            if (requestArgs.include_qr === true) {
                const cache = getQrCache();
                const qrOptions = {
                    size: 512,
                    includeBranding: true,
                    style: 'branded',
                    currencySymbol: payment.currency,
                    currencyImageUrl: currency?.network_image || undefined,
                    useCache: true,
                };
                // Check cache first, then generate optimized QR codes
                if (payment.address) {
                    const cachedAddress = cache.get(payment.identifier, 'address', 512, 'branded', true);
                    if (cachedAddress) {
                        response.qr_address = cachedAddress;
                    }
                    else {
                        const addressQr = await generateOptimizedQrCode(payment.address, qrOptions);
                        response.qr_address = {
                            data: `data:image/png;base64,${addressQr.buffer.toString('base64')}`,
                            format: 'png',
                            style: 'branded',
                            dimensions: `${addressQr.width}x${addressQr.height}`,
                        };
                        cache.set(payment.identifier, 'address', 512, 'branded', true, response.qr_address);
                    }
                }
                if (payment.paymentUri) {
                    const cachedPaymentUri = cache.get(payment.identifier, 'payment_uri', 512, 'branded', true);
                    if (cachedPaymentUri) {
                        response.qr_payment_uri = cachedPaymentUri;
                    }
                    else {
                        const paymentUriQr = await generateOptimizedQrCode(payment.paymentUri, qrOptions);
                        response.qr_payment_uri = {
                            data: `data:image/png;base64,${paymentUriQr.buffer.toString('base64')}`,
                            format: 'png',
                            style: 'branded',
                            dimensions: `${paymentUriQr.width}x${paymentUriQr.height}`,
                        };
                        cache.set(payment.identifier, 'payment_uri', 512, 'branded', true, response.qr_payment_uri);
                    }
                }
                logger.debug('Generated optimized QR codes for onchain payment', {
                    paymentId: payment.identifier,
                    hasAddressQr: !!response.qr_address,
                    hasPaymentUriQr: !!response.qr_payment_uri,
                    currency: payment.currency,
                    operation: 'create_payment_onchain_qr',
                });
            }
            const duration = Date.now() - startTime;
            logger.info('create_payment_onchain completed successfully', {
                operation: 'create_payment_onchain_success',
                paymentId: payment.identifier,
                currency: payment.currency,
                hasAddress: !!payment.address,
                hasPaymentUri: !!payment.paymentUri,
                duration,
                timestamp: new Date().toISOString(),
            });
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('create_payment_onchain failed', error, {
                operation: 'create_payment_onchain_error',
                duration,
                timestamp: new Date().toISOString(),
            });
            // Re-throw the error to be handled by MCP framework
            throw error;
        }
    }
    /**
     * Extract tag/memo from payment URI for currencies that require it
     */
    extractTagMemo(paymentUri, currency) {
        if (!paymentUri || !currency) {
            return undefined;
        }
        // Currencies that typically require memo/tag
        const memoRequiredCurrencies = ['XRP', 'XLM', 'ALGO'];
        if (!memoRequiredCurrencies.includes(currency)) {
            return undefined;
        }
        try {
            const url = new URL(paymentUri);
            // Extract from different URI parameter names based on currency
            const tagParams = ['dt', 'tag', 'memo', 'message'];
            for (const param of tagParams) {
                const value = url.searchParams.get(param);
                if (value) {
                    logger.debug(`Extracted ${param} for ${currency}`, {
                        currency,
                        paramType: param,
                        operation: 'extract_tag_memo',
                    });
                    return value;
                }
            }
            return undefined;
        }
        catch (error) {
            logger.warn('Failed to extract tag/memo from payment URI', {
                currency,
                error: error.message,
                operation: 'extract_tag_memo_error',
            });
            return undefined;
        }
    }
}
// Factory function for creating the handler
export function createPaymentOnchainHandler(paymentService, currencyService) {
    return new CreatePaymentOnchainHandler(paymentService, currencyService);
}
//# sourceMappingURL=create-payment-onchain.js.map