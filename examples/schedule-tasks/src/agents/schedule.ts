import { Agent, type Schedule } from 'agents'

export type ScheduleState = {
  messages: string[]
}

export class ScheduleAgent extends Agent<CloudflareBindings, ScheduleState> {
  initialState: ScheduleState = { messages: [] }

  // seconds 秒後に showMessage を実行するよう予約する
  async scheduleMessage(seconds: number, text: string) {
    await this.schedule(seconds, 'showMessage', { text })
  }

  // 予約時刻になると Agents SDK がこのメソッドを呼ぶ
  async showMessage(payload: { text: string }, _schedule: Schedule) {
    this.setState({ messages: [...this.state.messages, payload.text] })
  }

  async getMessages() {
    return this.state.messages
  }
}
