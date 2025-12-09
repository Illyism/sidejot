import { db } from './db'

export async function fetchWithKey(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const today = new Date()
  const plan = await db.getPlan(today)
  const openRouterKey = plan?.preferences?.openRouterKey
  const model = plan?.preferences?.model
  const headers = new Headers(init?.headers)

  if (openRouterKey) {
    headers.set('x-openai-key', openRouterKey)
  }
  if (model) {
    headers.set('x-model', model)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}
