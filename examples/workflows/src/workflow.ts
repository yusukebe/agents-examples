import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers'

type Params = {
  name: string
}

export class MyWorkflow extends WorkflowEntrypoint<CloudflareBindings, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // step.do は個別にリトライ・永続化される単位
    const greeting = await step.do('greet', async () => {
      return `Hello, ${event.payload.name}!`
    })

    // sleep 中はリソースを消費せず、DO の再起動をまたいでも継続する
    await step.sleep('take a break', '5 seconds')

    const farewell = await step.do('farewell', async () => {
      return `Goodbye, ${event.payload.name}!`
    })

    return { greeting, farewell }
  }
}
