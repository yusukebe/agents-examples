import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { getAgentByName } from 'agents'
export { ScheduleAgent } from './agents/schedule'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// GET /schedule?text=...&seconds=5 で「seconds 秒後にメッセージを表示」を予約
app.get('/schedule', async (c) => {
  const text = c.req.query('text') ?? 'Hello from the future!'
  const seconds = Number(c.req.query('seconds') ?? '5')

  const agent = await getAgentByName(c.env.ScheduleAgent, 'default')
  await agent.scheduleMessage(seconds, text)

  return c.text(`「${text}」を ${seconds} 秒後に予約しました`)
})

// GET / で、これまでに実行済みのメッセージ一覧を確認
app.get('/', async (c) => {
  const agent = await getAgentByName(c.env.ScheduleAgent, 'default')
  const messages = await agent.getMessages()

  return c.json(messages)
})

// GET /stream を開いておくと、予約が発火した瞬間にメッセージが流れてくる
app.get('/stream', (c) => {
  return streamSSE(c, async (stream) => {
    const agent = await getAgentByName(c.env.ScheduleAgent, 'default')
    let seen = 0

    while (!stream.aborted) {
      const messages = await agent.getMessages()
      while (seen < messages.length) {
        await stream.writeSSE({ data: messages[seen++] })
      }
      await stream.sleep(1000)
    }
  })
})

export default app
