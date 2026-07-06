# Cloudflare AI Agents examples

Minimal examples of the handy building blocks for building AI agents on Cloudflare. Each one is the smallest thing that shows the feature.

## Examples

| Example                                     | Feature        | What it shows                                          |
| ------------------------------------------- | -------------- | ------------------------------------------------------ |
| [counter](./examples/counter)               | Agents SDK     | A stateful Agent synced to a React client in real time |
| [workers-ai](./examples/workers-ai)         | Workers AI     | Run an LLM on the edge via the `AI` binding            |
| [schedule-tasks](./examples/schedule-tasks) | Schedule tasks | An Agent runs work later with `this.schedule()`        |
| [workflows](./examples/workflows)           | Workflows      | Durable, multi-step jobs with `step.do()`              |
| [browser-run](./examples/browser-run)       | Browser Run    | Screenshot a URL with a quick action                   |

More:

- [chat](./examples/chat) — Streaming AI chat agent (`AIChatAgent`)
- [push-notifications](./examples/push-notifications) — Web Push from an Agent

## Setup

```
pnpm install
```

Then run any example (see each folder's README for how to try it):

```
cd examples/counter
pnpm dev
```
