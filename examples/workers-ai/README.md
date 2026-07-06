# Workers AI

Run an LLM on Cloudflare's edge through the `AI` binding — no external API key.

## Try it

Workers AI runs on the real GPU network, so use `--remote` (already set in `dev`):

```
pnpm dev
```

Then hit it (pass `?q=` for your own prompt):

```
curl "http://localhost:8787/?q=What is a Durable Object?"
```
