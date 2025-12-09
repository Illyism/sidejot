import { getOpenRouter } from '@/lib/ai'
import { AI_CONFIG } from '@/lib/config'
import { generateText } from 'ai'
import { format } from 'date-fns'
import { diffWords } from 'diff'
import { NextResponse } from 'next/server'

async function getTitle(
  type: string,
  current: string,
  apiKey?: string,
  model?: string,
) {
  const openrouter = getOpenRouter(apiKey)
  const { text } = await generateText({
    model: openrouter.chat(model || AI_CONFIG.defaultModel),
    system: `Today is ${format(new Date(), 'MMMM d, yyyy')}. Your task is to write a brief summary of the current ${type}.`,
    prompt: `
# Current ${type}
${current}

Return a single, concise sentence summary of the current ${type} (max 5 words), nothing else.`,
  })
  return text.trim()
}

export async function POST(request: Request) {
  try {
    const { current, previous, type } = await request.json()
    const apiKey = request.headers.get('x-openai-key')
    const model = request.headers.get('x-model') || AI_CONFIG.defaultModel
    const openrouter = getOpenRouter(apiKey)

    // Skip AI call if there's no previous input to compare
    if (!previous || !current) {
      return NextResponse.json({
        summary: await getTitle(
          type,
          current,
          apiKey || undefined,
          model,
        ),
      })
    }

    if (previous === current) {
      return NextResponse.json({
        summary: await getTitle(
          type,
          current,
          apiKey || undefined,
          model,
        ),
      })
    }

    const diff = diffWords(previous, current)
    const added = diff.filter((part) => part.added).map((part) => part.value)
    const removed = diff
      .filter((part) => part.removed)
      .map((part) => part.value)

    console.log(diff)

    if (!added.length && !removed.length) {
      return NextResponse.json({
        summary: await getTitle(
          type,
          current,
          apiKey || undefined,
          model,
        ),
      })
    }

    const prompt = `Based on the following diff, write a single sentence title for the current ${type}:

# Previous
${previous}

# Current
${current}

# Changes
${added.length > 0 ? `## Added\n${added.join('\n')}` : ''}
${removed.length > 0 ? `## Removed\n${removed.join('\n')}` : ''}

# Task
Return a single, concise sentence summary of the changes (max 5 words), nothing else. If no changes, return a single sentence summary (max 5 words) of the current ${type}.
`

    const { text } = await generateText({
      model: openrouter.chat(model),
      system: `Today is ${format(new Date(), 'MMMM d, yyyy')}. Your task is to write a brief label for the current ${type}.`,
      prompt,
    })
    const summary = text.trim()

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating diff:', error)
    return NextResponse.json({ summary: 'Initial' })
  }
}
