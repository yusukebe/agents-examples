import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers'

type Params = {
  name: string
}

export class MyWorkflow extends WorkflowEntrypoint<CloudflareBindings, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // Each step.do is a unit that retries and persists independently.
    const greeting = await step.do('greet', async () => {
      return `Hello, ${event.payload.name}!`
    })

    // Sleeping consumes no resources and survives DO restarts.
    await step.sleep('take a break', '5 seconds')

    const farewell = await step.do('farewell', async () => {
      return `Goodbye, ${event.payload.name}!`
    })

    return { greeting, farewell }
  }
}
