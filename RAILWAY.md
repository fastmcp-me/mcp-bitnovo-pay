# Railway Deployment Guide for MCP Bitnovo Pay

## Quick Setup

### 1. Required Environment Variables in Railway

Set these variables in Railway Dashboard → Variables:

```bash
# Required - Bitnovo API Credentials
BITNOVO_DEVICE_ID=your_device_id_here
BITNOVO_BASE_URL=https://api.bitnovo.com

# Optional - Device Secret (if you have one)
BITNOVO_DEVICE_SECRET=your_device_secret

# HTTP Mode - Railway auto-configures PORT
# (no need to set manually, Railway provides it)

# Logging (optional)
LOG_LEVEL=info
NODE_ENV=production
```

### 2. Railway Configuration

Railway should auto-detect:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start` (runs `node dist/index.js`)
- **Port**: Railway automatically sets `PORT` env var

### 3. Verify Deployment

After deployment, test your endpoints:

```bash
# Health check
curl https://your-app.up.railway.app/health

# Server info
curl https://your-app.up.railway.app/

# OAuth discovery endpoints (for claude.ai)
curl https://your-app.up.railway.app/.well-known/oauth-authorization-server/mcp
curl https://your-app.up.railway.app/.well-known/oauth-protected-resource/mcp
```

### 4. Connect to Claude.ai

In Claude.ai, add a new MCP server:

1. Go to Settings → Model Context Protocol
2. Add new server
3. **Server URL**: `https://your-app.up.railway.app/mcp`
4. The server will use the OAuth discovery endpoints automatically

## Available Endpoints

- `POST /mcp` - Main MCP protocol endpoint
- `GET /health` - Health check endpoint
- `GET /` - Server information
- `GET /.well-known/oauth-authorization-server/mcp` - OAuth discovery
- `GET /.well-known/oauth-protected-resource/mcp` - OAuth resource metadata

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `BITNOVO_DEVICE_ID` | Your Bitnovo device ID (min 8 chars) | `abc12345678` |
| `BITNOVO_BASE_URL` | Bitnovo API base URL | `https://api.bitnovo.com` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `BITNOVO_DEVICE_SECRET` | Device secret (if configured) | - |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |
| `NODE_ENV` | Environment (development, production) | `production` |
| `API_TIMEOUT` | API timeout in milliseconds | `10000` |
| `MAX_RETRIES` | Max API retry attempts | `3` |
| `RETRY_DELAY` | Delay between retries (ms) | `1500` |

## Troubleshooting

### 502 Bad Gateway / Connection Timeout

1. Check that Railway has assigned the `PORT` variable
2. Verify `BITNOVO_DEVICE_ID` and `BITNOVO_BASE_URL` are set
3. Check Railway logs for startup errors

### Claude.ai Connection Issues

1. Ensure all OAuth endpoints respond with 200 status
2. Verify the Railway URL is publicly accessible
3. Check that the `/mcp` endpoint responds to POST requests

### Logs

View logs in Railway Dashboard → Deployments → [Your Deployment] → Logs

Look for:
- `HTTP server listening` - Server started successfully
- `MCP Bitnovo Pay Server started successfully (HTTP mode)` - Ready for connections

## Testing Locally Before Railway

```bash
# Set environment variables
export PORT=3000
export BITNOVO_DEVICE_ID=your_device_id
export BITNOVO_BASE_URL=https://api.bitnovo.com

# Build and run
npm install
npm run build
npm start

# Test
curl http://localhost:3000/health
```

## Common Errors

### "Missing required environment variables"

**Solution**: Set `BITNOVO_DEVICE_ID` and `BITNOVO_BASE_URL` in Railway variables

### "connection dial timeout"

**Solution**:
1. Check that the app is starting (view logs)
2. Ensure `PORT` is not manually set (Railway sets it automatically)
3. Verify the start command is `npm start` or `node dist/index.js`

### "client has closed the request"

**Solution**: Server is taking too long to start. Check logs for initialization errors.
