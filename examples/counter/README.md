# Agents SDK (counter)

A minimal stateful Agent. The count is stored in the Agent and synced to the
React client in real time via `setState` — `@callable` methods (`increment` /
`decrement`) are invoked over WebSocket.

## Try it

```
pnpm dev
```

Open the printed URL and click + / -. The value lives in the Agent, not the
browser.
