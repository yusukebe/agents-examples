import { Hono } from 'hono'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', async (c) => {
  const prompt = c.req.query('q') ?? 'Cloudflare Workers を一言で説明して'

  const result = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }]
  })

  return c.json(result)
})

export default app
