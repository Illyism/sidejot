import {
  createApiKeyRequiredResponse,
  getApiKeyFromRequest,
  getOpenRouter,
} from '@/lib/ai'
import { AI_CONFIG } from '@/lib/config'
import { streamText, convertToModelMessages } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const apiKey = getApiKeyFromRequest(req)
  if (!apiKey) {
    return createApiKeyRequiredResponse()
  }

  const { messages } = await req.json()
  const model = req.headers.get('x-model') || AI_CONFIG.defaultModel
  const openrouter = getOpenRouter(apiKey)

  const result = await streamText({
    model: openrouter.chat(model),
    messages: convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
