import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { sendMessage } from '@/app/actions/chat'

// Placeholder responses for different AI models
const modelResponses: Record<string, string> = {
  'dolphin': 'Dolphin AI: This is a response from Dolphin, an efficient model. I&apos;m here to help with quick, accurate responses.',
  'github': 'GitHub Copilot: I can help you with code generation and programming tasks. Let me assist you with your query.',
  'claude': 'Claude: I&apos;m Claude, made by Anthropic. I can help with complex reasoning, analysis, and creative tasks.',
  'perplexity': 'Perplexity: I can provide comprehensive answers with real-time information. Let me help you explore this topic.',
  'glm': 'GLM: I&apos;m a large language model designed to understand and assist with various tasks.',
  'hy3': 'HY3: I&apos;m here to provide helpful, harmless, and honest responses to your questions.',
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId, message, agent } = await req.json()

    if (!chatId || !message || !agent) {
      return Response.json(
        { error: 'Missing required fields: chatId, message, agent' },
        { status: 400 }
      )
    }

    // For now, return placeholder response
    // In production, integrate with actual AI APIs
    const response = modelResponses[agent] || 'AI Response: I can help you with this.'

    // Save message to database
    const result = await sendMessage(chatId, message, agent, response)

    return Response.json({
      success: true,
      userMessageId: result.userMessageId,
      assistantMessageId: result.assistantMessageId,
      response,
    })
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
