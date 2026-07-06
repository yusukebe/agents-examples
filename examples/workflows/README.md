# Workflows

A durable, multi-step job with `WorkflowEntrypoint` and `step.do()`. Each step
is retried and persisted independently, and `step.sleep` pauses without using
resources.

## Try it

```
pnpm dev
```

Start an instance, then poll its status until it completes:

```
curl "http://localhost:8787/start?name=Yusuke"
curl "http://localhost:8787/status/<id>"
```

The status moves `running` -> `complete`, with each step's output persisted.
