import { Hono } from 'hono'
export { MyWorkflow } from './workflow'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Start a Workflow instance and return its id.
app.get('/start', async (c) => {
  const name = c.req.query('name') ?? 'World'
  const instance = await c.env.MY_WORKFLOW.create({ params: { name } })

  return c.json({ id: instance.id })
})

// Check the run status of an instance.
app.get('/status/:id', async (c) => {
  const instance = await c.env.MY_WORKFLOW.get(c.req.param('id'))
  const status = await instance.status()

  return c.json(status)
})

export default app
