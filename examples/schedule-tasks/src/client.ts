import { AgentClient } from 'agents/client'
import type { ScheduleState } from './agents/schedule'

// Connect to the Agent over WebSocket and just watch its state.
// The Agent's setState is delivered to onStateUpdate automatically.
new AgentClient<ScheduleState>({
  agent: 'ScheduleAgent',
  name: 'default',
  host: 'http://localhost:8787',
  onStateUpdate: (state) => {
    console.log('messages:', state.messages)
  }
})

console.log('watching ScheduleAgent... (Ctrl+C to stop)')
