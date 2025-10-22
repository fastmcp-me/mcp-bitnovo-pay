#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
declare class MCPBitnovoServer {
    private server;
    private paymentService;
    private currencyService;
    private webhookServer;
    private config;
    constructor();
    /**
     * Initialize webhook infrastructure (event store and HTTP server)
     */
    private initializeWebhookInfrastructure;
    private setupToolHandlers;
    private setupErrorHandlers;
    private shutdown;
    /**
     * Start MCP server in HTTP mode for remote connections (claude.ai, Railway, etc.)
     */
    private startHttpMode;
    start(): Promise<void>;
    getServer(): Server;
}
export { MCPBitnovoServer };
export default MCPBitnovoServer;
//# sourceMappingURL=index.d.ts.map