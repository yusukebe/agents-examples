# Browser Run

Take a screenshot with Browser Run's quick actions — one binding call (`env.BROWSER.quickAction('screenshot', { url })`), no Puppeteer, no API token.

## Try it

Quick actions always run on the real browser network (the binding uses
`remote: true`), so a plain `pnpm dev` already talks to it:

```
pnpm dev
```

Open in a browser to get a PNG (pass `?url=` for any page):

```
http://localhost:8787/?url=https://example.com
```
