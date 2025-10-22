# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-10-22

### Added
- **HTTP Transport Mode**: Support for remote MCP connections via StreamableHTTP
  - Enables deployment on cloud platforms (Railway, Heroku, Fly.io, etc.)
  - Compatible with claude.ai web interface
  - Auto-detects transport mode based on PORT environment variable
  - `/health` endpoint for monitoring and health checks
  - Server info endpoint at `/` with version and documentation
- **OAuth 2.0 Discovery Endpoints**: Full OAuth metadata support
  - `/.well-known/oauth-authorization-server/mcp` for authorization server metadata
  - `/.well-known/oauth-protected-resource/mcp` for resource server metadata
  - Enables automatic discovery by AI platforms
- **Docker Support**: Production-ready Dockerfile
  - Multi-stage build process with optimized caching
  - Automatic TypeScript compilation during build
  - Production dependencies only in final image
  - Configurable via environment variables
- **Railway Deployment Guide**: Complete documentation in RAILWAY.md
  - Step-by-step deployment instructions
  - Environment variable reference
  - Troubleshooting guide
  - Testing procedures

### Changed
- **MCP SDK Updated**: Upgraded from v1.0.0 to v1.20.0
  - Latest StreamableHTTP transport features
  - Improved stability and performance
  - Enhanced protocol compliance
- **Dual Transport Support**: Server now runs in stdio or HTTP mode
  - stdio: Local connections (Claude Desktop, CLI)
  - HTTP: Remote connections (claude.ai, cloud platforms)
  - Automatic mode detection based on environment

### Improved
- Better error messages in HTTP mode with structured JSON responses
- Graceful shutdown handling for both transport modes
- Enhanced logging for HTTP requests and responses
- Production-ready deployment configuration

## [1.0.0] - 2025-01-30

### Added
- Initial release of MCP Bitnovo Pay server
- Five MCP tools for cryptocurrency payment management:
  - `create_payment_onchain` - Generate cryptocurrency addresses for direct payments
  - `create_payment_link` - Create web payment URLs with redirect handling
  - `get_payment_status` - Query payment status with detailed information
  - `list_currencies_catalog` - Get supported cryptocurrencies with filtering
  - `generate_payment_qr` - Generate custom QR codes from existing payments
- Multi-LLM support (OpenAI, Google Gemini, Claude)
- Privacy-focused logging with sensitive data masking
- Retry logic with exponential backoff
- Comprehensive error handling with structured error codes
- TypeScript strict mode implementation
- Test suite with Jest (80%+ coverage target)
- Security features:
  - HTTPS enforcement
  - HMAC signature validation for webhooks
  - Environment variable validation
  - Graceful shutdown handling

### Security
- Sensitive data (addresses, device IDs, secrets) are masked in all logs
- No exchange rates exposed in responses (privacy protection)
- URL validation for redirect endpoints
- Zod schema validation for all inputs

## [1.1.0] - 2025-09-30

### Added
- High-quality QR code generation with improved algorithms
- Bitnovo Pay logo branding in QR codes (from SVG asset)
- Three additional webhook-related MCP tools:
  - `get_webhook_events` - Query webhook events received in real-time
  - `get_webhook_url` - Get public webhook URL with configuration
  - `get_tunnel_status` - Diagnose tunnel connection status
- Automatic webhook tunnel system with 3 providers (ngrok, zrok, manual)
- Context auto-detection for deployment environments

### Changed
- QR code default size increased from 300px to 512px
- QR code maximum size increased from 1000px to 2000px
- Improved QR pattern rendering with `nearest` kernel (sharper edges)
- Enhanced logo scaling with `lanczos3` kernel (smoother scaling)
- PNG compression optimized (level 6 with adaptive filtering)
- Better quality for printing and high-resolution displays

### Improved
- QR codes now have sharp, well-defined edges without pixelation
- Professional-quality output suitable for printing (up to 2000px)
- Better visual clarity on modern high-DPI displays (Retina, 4K)
- Optimized file sizes with high-quality compression
- **Payment Expiration UX**: `create_payment_onchain` includes `expires_at` timestamp
  - ISO 8601 format indicating exact payment deadline
  - Timer starts immediately when cryptocurrency address is generated
  - Consistent with `create_payment_link` behavior
  - Helps users and AI agents communicate time urgency effectively