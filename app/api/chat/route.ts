import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Check if ANTHROPIC_API_KEY is available
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      // Return a helpful response when API key is not configured
      return NextResponse.json({
        content: `Hello! I'm a demo of the Open WebUI interface. To enable actual AI responses:

1. Get an API key from https://console.anthropic.com
2. Add it to your environment: \`ANTHROPIC_API_KEY=your_key_here\`
3. Redeploy your application

For now, I can only echo that I received your message: "${messages[messages.length - 1]?.content}"

This is a fully functional chat interface with:
- Multiple chat sessions
- Chat history saved in browser
- Markdown rendering with code syntax highlighting
- Dark mode UI similar to Open WebUI
- Responsive design

Once you configure the API key, you'll be able to have real conversations with Claude AI!`
      })
    }

    // Make request to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: messages,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      return NextResponse.json(
        { error: 'Failed to get response from Claude API' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.content[0]?.text || 'Sorry, I could not generate a response.'

    return NextResponse.json({ content: assistantMessage })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
