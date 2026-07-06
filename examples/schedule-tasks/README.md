# Schedule tasks

An Agent schedules a task with `this.schedule()`. When it fires, `setState()`
pushes the result to every connected client automatically.

- **Register**: Hono app (`GET /schedule`)
- **List**: Hono app (`GET /`)
- **Watch (live)**: CLI (`node src/client.ts`) via `AgentClient`

## Try it

Start the Worker:

```
pnpm dev
```

Watch state live from a CLI client (stays connected):

```
node src/client.ts
```

In another terminal, schedule a message and list what has fired:

```
curl "http://localhost:8787/schedule?text=Hello&seconds=5"
curl "http://localhost:8787/"
```

After ~5 seconds the scheduled message is pushed to the CLI client.
