import { Hono } from 'hono'
import { agentsMiddleware } from 'hono-agents'
import { getAgentByName } from 'agents'
export { ScheduleAgent } from './agents/schedule'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Route WebSocket requests (from the CLI viewer) to the Agent.
app.use('*', agentsMiddleware())

// Register: schedule a message to show after `seconds` seconds.
app.get('/schedule', async (c) => {
  const text = c.req.query('text') ?? 'Hello from the future!'
  const seconds = Number(c.req.query('seconds') ?? '5')

  const agent = await getAgentByName(c.env.ScheduleAgent, 'default')
  await agent.scheduleMessage(seconds, text)

  return c.text(`scheduled "${text}" in ${seconds}s`)
})

// List messages that have fired so far.
app.get('/', async (c) => {
  const agent = await getAgentByName(c.env.ScheduleAgent, 'default')
  return c.json(await agent.getMessages())
})

export default app
