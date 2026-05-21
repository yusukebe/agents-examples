import { AIChatAgent } from '@cloudflare/ai-chat'
import { createWorkersAI } from 'workers-ai-provider'
import { streamText, convertToModelMessages, pruneMessages, tool, stepCountIs } from 'ai'
import { z } from 'zod'

export class ChatAgent extends AIChatAgent<CloudflareBindings> {
  async onChatMessage() {
    const workersai = createWorkersAI({ binding: this.env.AI })

    const result = streamText({
      model: workersai('@cf/meta/llama-4-scout-17b-16e-instruct'),
      system:
        'You are a helpful assistant. You can check the weather, ' + "get the user's timezone, and run calculations.",
      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: 'before-last-2-messages'
      }),
      tools: {
        // Server-side tool: runs automatically on the server
        getWeather: tool({
          description: 'Get the current weather for a city',
          inputSchema: z.object({
            city: z.string().describe('City name')
          }),
          execute: async ({ city }) => {
            // Replace with a real weather API in production
            const conditions = ['sunny', 'cloudy', 'rainy']
            const temp = Math.floor(Math.random() * 30) + 5
            return {
              city,
              temperature: temp,
              condition: conditions[Math.floor(Math.random() * conditions.length)]
            }
          }
        }),

        // Client-side tool: no execute function — the browser handles it
        getUserTimezone: tool({
          description: "Get the user's timezone from their browser",
          inputSchema: z.object({})
        }),

        // Approval tool: requires user confirmation before executing
        calculate: tool({
          description: 'Perform a math calculation with two numbers. ' + 'Requires user approval for large numbers.',
          inputSchema: z.object({
            a: z.number().describe('First number'),
            b: z.number().describe('Second number'),
            operator: z.enum(['+', '-', '*', '/', '%']).describe('Arithmetic operator')
          }),
          needsApproval: async ({ a, b }) => Math.abs(a) > 1000 || Math.abs(b) > 1000,
          execute: async ({ a, b, operator }) => {
            const ops: Record<string, (x: number, y: number) => number> = {
              '+': (x, y) => x + y,
              '-': (x, y) => x - y,
              '*': (x, y) => x * y,
              '/': (x, y) => x / y,
              '%': (x, y) => x % y
            }
            if (operator === '/' && b === 0) {
              return { error: 'Division by zero' }
            }
            return {
              expression: `${a} ${operator} ${b}`,
              result: ops[operator](a, b)
            }
          }
        })
      },
      stopWhen: stepCountIs(5)
    })

    return result.toUIMessageStreamResponse()
  }
}
