import { useEffect, useState } from 'react'
import { useAgent } from 'agents/react'
import { decodeBase64Url } from 'hono/utils/encode'
import type { ReminderAgent, ReminderAgentState, Subscription } from '../agents/reminder'

export function Reminders() {
  const [state, setState] = useState<ReminderAgentState>({ subscriptions: [], reminders: [] })
  const [message, setMessage] = useState('Check the oven')
  const [delay, setDelay] = useState(10)
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  const agent = useAgent<ReminderAgent, ReminderAgentState>({
    agent: 'ReminderAgent',
    onStateUpdate: (s) => setState(s)
  })

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    navigator.serviceWorker.register('/sw.js')
  }, [])

  const subscribe = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result !== 'granted') return

    const vapidPublicKey = await agent.stub.getVapidPublicKey()
    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeBase64Url(vapidPublicKey)
    })

    const json = subscription.toJSON() as {
      endpoint: string
      expirationTime: number | null
      keys: { p256dh: string; auth: string }
    }
    const sub: Subscription = {
      endpoint: json.endpoint,
      expirationTime: json.expirationTime ?? null,
      keys: json.keys
    }
    await agent.stub.subscribe(sub)
  }

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    await agent.stub.unsubscribe(sub.endpoint)
    await sub.unsubscribe()
  }

  const create = async () => {
    await agent.stub.createReminder(message, delay)
  }

  return (
    <div>
      <section>
        <h2>Push subscription</h2>
        <p>Permission: {permission}</p>
        <p>Subscriptions: {state.subscriptions.length}</p>
        <button onClick={subscribe}>Subscribe</button>
        <button onClick={unsubscribe}>Unsubscribe</button>
      </section>

      <section>
        <h2>Schedule reminder</h2>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="message" />
        <input
          type="number"
          value={delay}
          min={1}
          onChange={(e) => setDelay(Number(e.target.value))}
          style={{ width: '5em' }}
        />
        <span> seconds</span>
        <button onClick={create}>Create</button>
      </section>

      <section>
        <h2>Reminders</h2>
        <ul>
          {state.reminders.map((r) => (
            <li key={r.id}>
              [{r.sent ? 'sent' : 'pending'}] {r.message} @ {new Date(r.scheduledAt).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
