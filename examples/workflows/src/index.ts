import { Hono } from 'hono'
export { MyWorkflow } from './workflow'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// GET /start?name=... で Workflow インスタンスを起動し、その id を返す
app.get('/start', async (c) => {
  const name = c.req.query('name') ?? 'World'
  const instance = await c.env.MY_WORKFLOW.create({ params: { name } })

  return c.json({ id: instance.id })
})

// GET /status/:id で、そのインスタンスの実行状況を確認
app.get('/status/:id', async (c) => {
  const instance = await c.env.MY_WORKFLOW.get(c.req.param('id'))
  const status = await instance.status()

  return c.json(status)
})

export default app
