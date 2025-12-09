import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export function getOpenRouter(apiKey?: string | null) {
  return createOpenRouter({
    apiKey: apiKey || process.env.OPENROUTER_API_KEY,
  })
}
