import { getOpenRouter } from '@/lib/ai'
import { AI_CONFIG } from '@/lib/config'
import { streamObject, createTextStreamResponse } from 'ai'
import { generatePlanSchema } from './schema'

export async function POST(req: Request) {
  try {
    const input = await req.json()
    const apiKey = req.headers.get('x-openai-key')
    const model = req.headers.get('x-model') || AI_CONFIG.defaultModel

    if (!input || !input.content) {
      return new Response('Plan content is required', { status: 400 })
    }

    // Check if API key is available
    const finalApiKey = apiKey || process.env.OPENROUTER_API_KEY
    if (!finalApiKey) {
      return new Response(
        JSON.stringify({
          error: 'API key is required. Please set your OpenRouter API key in settings.',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const openrouter = getOpenRouter(apiKey)

    const result = streamObject({
      model: openrouter.chat(model),
      schema: generatePlanSchema,
      output: 'object',
      prompt: `
        Context:
        ${JSON.stringify(input)}

        Generate a list of specific, actionable tasks where:
        - Write a super concise description of the task (single sentence)
        - Ideally, 2-7 words
        - Each task should take exactly 25 minutes (one pomodoro)
        - Tasks must be ADHD-friendly: clear, specific, and actionable
        - Focus on one clear objective per task
        - Make as few tasks as possible while maintaining clarity
        - Add a "backlog" section with tasks that are not due today but should be later

        Adding tags:
        - Only if relevant
        - Tag examples: "<project-name>", "blog", "seo", "meeting", "life"
        - Tags should be a single word
        - Add "focus" tag for high-concentration tasks
        - Add "adhd" tag for tasks requiring extra attention management
        - Add "important" tag for tasks that are high priority and critical to the day

        Reasoning step:
        - Take a deep breath and think step-by-step about the plan and context

        Notes:
        - Add any additional notes about the plan here, things you left out, important details, etc. It's to communicate to the user why you made the choices you did.
        - Keep it super concise, max 80 characters
      `,
    })

    return createTextStreamResponse({
      textStream: result.textStream,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API route error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(
      JSON.stringify({
        error: errorMessage,
        message: errorMessage,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
