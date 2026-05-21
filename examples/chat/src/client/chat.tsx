import { useAgent } from 'agents/react'
import { useAgentChat } from '@cloudflare/ai-chat/react'

export function Chat() {
  const agent = useAgent({ agent: 'ChatAgent' })

  const { messages, sendMessage, clearHistory, addToolApprovalResponse, status } = useAgentChat({
    agent,
    // Handle client-side tools (tools with no server execute function)
    onToolCall: async ({ toolCall, addToolOutput }) => {
      if (toolCall.toolName === 'getUserTimezone') {
        addToolOutput({
          toolCallId: toolCall.toolCallId,
          output: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localTime: new Date().toLocaleTimeString()
          }
        })
      }
    }
  })

  return (
    <div>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.role}:</strong>
            {msg.parts.map((part, i) => {
              if (part.type === 'text') {
                return <span key={i}>{part.text}</span>
              }

              // Render approval UI for tools that need confirmation
              if (part.type === 'dynamic-tool' && part.state === 'approval-responded') {
                return (
                  <div key={part.toolCallId}>
                    <p>
                      Approve <strong>{part.toolName}</strong>?
                    </p>
                    <pre>{JSON.stringify(part.input, null, 2)}</pre>
                    <button
                      onClick={() =>
                        addToolApprovalResponse({
                          id: part.toolCallId,
                          approved: true
                        })
                      }
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        addToolApprovalResponse({
                          id: part.toolCallId,
                          approved: false
                        })
                      }
                    >
                      Reject
                    </button>
                  </div>
                )
              }

              // Show completed tool results
              if (part.type === 'dynamic-tool' && part.state === 'output-available') {
                return (
                  <details key={part.toolCallId}>
                    <summary>{part.toolName} result</summary>
                    <pre>{JSON.stringify(part.output, null, 2)}</pre>
                  </details>
                )
              }

              return null
            })}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement
          sendMessage({ text: input.value })
          input.value = ''
        }}
      >
        <input name="message" placeholder="Try: What's the weather in Paris?" />
        <button type="submit" disabled={status === 'streaming'}>
          Send
        </button>
      </form>

      <button onClick={clearHistory}>Clear history</button>
    </div>
  )
}
