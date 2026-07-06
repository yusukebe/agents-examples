import { Hono } from 'hono'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
  const url = c.req.query('url') ?? 'https://example.com'

  // Quick action: screenshot a URL with one binding call. No Puppeteer.
  return c.env.BROWSER.quickAction('screenshot', { url })
})

export default app
