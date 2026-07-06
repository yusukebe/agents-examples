import { Hono } from 'hono'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', async (c) => {
  // Run an LLM via the AI binding. Pass ?q= to change the prompt.
  const prompt = c.req.query('q') ?? 'Explain Cloudflare Workers in one sentence.'

  const result = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
    messages: [{ role: 'user', content: prompt }]
  })

  return c.json(result)
})

export default app
