import { Agent, type Schedule } from 'agents'

export type ScheduleState = {
  messages: string[]
}

export class ScheduleAgent extends Agent<CloudflareBindings, ScheduleState> {
  initialState: ScheduleState = { messages: [] }

  // Called from the Hono app. Runs showMessage after `seconds` seconds.
  async scheduleMessage(seconds: number, text: string) {
    await this.schedule(seconds, 'showMessage', { text })
  }

  // Runs when the schedule fires. setState auto-syncs to connected clients.
  async showMessage(payload: { text: string }, _schedule: Schedule) {
    this.setState({ messages: [...this.state.messages, payload.text] })
  }

  async getMessages() {
    return this.state.messages
  }
}
