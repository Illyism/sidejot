import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export const API_KEY_REQUIRED_ERROR =
  'API key is required. Please set your OpenRouter API key in settings.'

export function getApiKeyFromRequest(request: Request): string | null {
  const key = request.headers.get('x-openai-key')?.trim()
  return key || null
}

export function createApiKeyRequiredResponse(): Response {
  return new Response(JSON.stringify({ error: API_KEY_REQUIRED_ERROR }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getOpenRouter(apiKey: string) {
  return createOpenRouter({ apiKey })
}
