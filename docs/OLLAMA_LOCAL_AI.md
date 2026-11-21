# Optional local AI with Ollama

GLOBAL FUNN can optionally call a locally running Ollama instance for draft-only text tasks. This is a local development integration, not a hosted/cloud inference service.

## Configuration

Copy the placeholders from `.env.example` into `.env.local`:

```dotenv
OLLAMA_ENABLED=false
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:1b
```

Set `OLLAMA_ENABLED=true` only when Ollama is installed and running on the same machine as the Next.js server. Restart the dev server after changing environment variables.

## Endpoints

- `GET /api/ollama/health` checks local reachability and whether the configured model is installed.
- `POST /api/ollama/generate` accepts JSON `{"prompt":"..."}` and returns a draft response.

The provider restricts its base URL to loopback addresses, uses a 30-second timeout, and does not stream. Prompts are limited to 8,000 characters. Generated text is an unverified draft and requires human review before editorial use.

## Boundaries

- Disabled by default.
- No credentials or third-party provider routing.
- No public publishing, uploads, broadcasting, or trading actions.
- The app must not expose Ollama's port to the public internet.
- In a cloud deployment, loopback points to the cloud server, not the user's PC; this integration is intended for local development unless a separately secured architecture is designed.
