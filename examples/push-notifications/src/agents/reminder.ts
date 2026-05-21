import { Agent, callable } from 'agents'
import webpush from 'web-push'

export type Subscription = {
  endpoint: string
  expirationTime: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

export type Reminder = {
  id: string
  message: string
  scheduledAt: number
  sent: boolean
}

export type ReminderAgentState = {
  subscriptions: Subscription[]
  reminders: Reminder[]
}

export class ReminderAgent extends Agent<CloudflareBindings, ReminderAgentState> {
  initialState: ReminderAgentState = {
    subscriptions: [],
    reminders: []
  }

  @callable()
  getVapidPublicKey(): string {
    return this.env.VAPID_PUBLIC_KEY
  }

  @callable()
  async subscribe(subscription: Subscription): Promise<{ ok: boolean }> {
    const exists = this.state.subscriptions.some((s) => s.endpoint === subscription.endpoint)
    if (!exists) {
      this.setState({
        ...this.state,
        subscriptions: [...this.state.subscriptions, subscription]
      })
    }
    return { ok: true }
  }

  @callable()
  async unsubscribe(endpoint: string): Promise<{ ok: boolean }> {
    this.setState({
      ...this.state,
      subscriptions: this.state.subscriptions.filter((s) => s.endpoint !== endpoint)
    })
    return { ok: true }
  }

  @callable()
  async createReminder(message: string, delaySeconds: number): Promise<Reminder> {
    const id = crypto.randomUUID()
    const scheduledAt = Date.now() + delaySeconds * 1000
    const reminder: Reminder = { id, message, scheduledAt, sent: false }

    this.setState({
      ...this.state,
      reminders: [...this.state.reminders, reminder]
    })

    await this.schedule(delaySeconds, 'sendReminder', { id, message })
    return reminder
  }

  async sendReminder(payload: { id: string; message: string }) {
    webpush.setVapidDetails(this.env.VAPID_SUBJECT, this.env.VAPID_PUBLIC_KEY, this.env.VAPID_PRIVATE_KEY)

    const deadEndpoints: string[] = []

    console.log('[sendReminder] start', { id: payload.id, subs: this.state.subscriptions.length })

    await Promise.all(
      this.state.subscriptions.map(async (sub) => {
        try {
          const result = await webpush.sendNotification(
            sub,
            JSON.stringify({
              title: 'Reminder',
              body: payload.message,
              tag: `reminder-${payload.id}`
            })
          )
          console.log('[sendReminder] sent', { endpoint: sub.endpoint, statusCode: result.statusCode })
        } catch (err: unknown) {
          const statusCode = err instanceof webpush.WebPushError ? err.statusCode : 0
          console.error('[sendReminder] failed', { endpoint: sub.endpoint, statusCode, err })
          if (statusCode === 404 || statusCode === 410) {
            deadEndpoints.push(sub.endpoint)
          }
        }
      })
    )

    if (deadEndpoints.length > 0) {
      this.setState({
        ...this.state,
        subscriptions: this.state.subscriptions.filter((s) => !deadEndpoints.includes(s.endpoint))
      })
    }

    this.setState({
      ...this.state,
      reminders: this.state.reminders.map((r) => (r.id === payload.id ? { ...r, sent: true } : r))
    })

    this.broadcast(
      JSON.stringify({
        type: 'reminder_sent',
        id: payload.id,
        timestamp: Date.now()
      })
    )
  }
}
