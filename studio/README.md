# Voice Diagram Studio

A voice-first diagram editor: describe a diagram, then keep talking to refine it. Every
request is a precise edit of what is on the canvas, never a redraw. Each diagram has a title
and its own documentation tab (a book of chapters with a table of contents), diagrams live
on pages (tabs), and every generated diagram stays in the history panel. Everything exports
to draw.io; a diagram also exports as a PNG or SVG picture or is copied to the clipboard, and
the documentation exports to Markdown.

## Run

```bash
cd studio
./studio.sh          # installs what is missing, asks for the Gemini key once, opens http://127.0.0.1:5173
./studio.sh key      # saves or replaces the key (macOS Keychain); forget-key deletes it
./studio.sh check    # checks key → token → Live session against the real API
./studio.sh eval     # scores the real model; also: test, e2e, build (./studio.sh help)
```

The Gemini API key stays on the local server and never reaches the browser (see
[API key security](#api-key-security)).

Press **Space** or the mic button to talk, **/** to type a request, **⌘Z / ⇧⌘Z** to undo/redo,
**Enter** to rename the selected node or edit the selected text or table.

| View | Shortcut |
| --- | --- |
| Zoom in / out | **⌘+ / ⌘−** (or ⌘ + scroll, pinch) |
| 100 % | **⌘0** or **⇧0** |
| Fit everything | **⇧1** |
| Zoom to the selection | **⇧2** |
| Minimap | **M** |

The zoom level button (bottom left) opens presets (50–200 %).

## What you can ask for

| Say | Gemini calls |
| --- | --- |
| "Draw a web app on Google Cloud …" | `create_diagram` (with a title shown above the diagram and on its tab) |
| "Add a Redis cache between the API and the database" | `edit_diagram` |
| "Document this architecture" (or **Document this diagram** in an empty Documentation tab) | `write_text` / `write_table`, one call per chapter: an arc42-style book (see [below](#how-gemini-writes-architecture-documentation)) |
| "Add an ADR for the cache", "write the risks", "a runbook for a database outage" | one chapter; a new decision record is appended to `decisions` |
| "Update the documentation" | rewrites only the chapters that no longer match the diagram |
| "Add a table of the components / ports / costs" | `write_table`: a table chapter |
| "Add a security chapter after the overview" | `write_text` with `after: "overview"` |
| "Open the documentation", "back to the diagram" | `switch_page` with `view: "documentation"` / `"diagram"` |
| "Now draw the checkout flow in a new tab" | `create_diagram` with `new_page: true` (the current diagram stays on its page) |
| "Go to the first tab", "rename this tab", "close the security tab" | `switch_page`, `rename_page`, `delete_page` |
| "Zoom in", "show everything", "zoom on the database" | `change_view` |

## Documentation

The documentation is never drawn on the canvas. A page that has documentation gets a
**Documentation** tab right after its diagram tab. It reads like a book: the contents on the
left list the numbered chapters and the `## ` sections of the open chapter (the section being
read is marked), one chapter is shown at a time, and **←** / **→** or the links at its end turn
the pages. The cover shows the diagram; click it to go back.

Writing a chapter by voice opens the tab at that chapter; an edit of the diagram shows the
diagram again. The open chapter is the selection, so "rewrite this chapter" means it.
Chapters can also be added from the top bar or the contents, edited (**Enter**, a table as
rows of `cell | cell`), moved up and down and deleted by hand. **Export → Documentation
(.md)** saves the book as Markdown; the draw.io export adds a documentation page after each
diagram that has one.

### How Gemini writes architecture documentation

"Document this architecture" produces a lean [arc42](https://arc42.org/overview) book, with the
context and containers of the [C4 model](https://c4model.com) as tables and the decisions as
[architecture decision records](https://adr.github.io) (ADRs). The chapters always have the same
ids, so later requests ("update the documentation", "add an ADR") change them in place.

| # | Chapter (id) | Tool | Content | Based on |
| --- | --- | --- | --- | --- |
| 1 | Introduction and goals (`overview`) | `write_text` | Purpose, top 3 quality goals with measurable targets, stakeholders | arc42 §1 |
| 2 | Context and scope (`context`) | `write_table` | Actor or external system · Interface · Data exchanged | arc42 §3, C4 system context |
| 3 | Building blocks (`building_blocks`) | `write_table` | Component · Technology · Responsibility · Depends on | arc42 §5, C4 containers |
| 4 | Runtime view (`runtime`) | `write_text` | 2–3 key scenarios as numbered steps along the connections, sync or async | arc42 §6 |
| 5 | Deployment (`deployment`) | `write_text` | Cloud, regions, networks, environments, scaling, CI/CD, observability | arc42 §7 |
| 6 | Cross-cutting concepts (`crosscutting`) | `write_text` | Security, reliability, performance, cost | arc42 §8, Google Cloud Architecture Framework |
| 7 | Architecture decisions (`decisions`) | `write_text` | `ADR-n` sections: status, context, decision, consequences, alternatives | arc42 §9, Nygard ADRs |
| 8 | Risks and technical debt (`risks`) | `write_table` | Risk · Impact · Likelihood · Mitigation, most serious first | arc42 §11 |
| 9 | Glossary (`glossary`) | `write_table` | Domain terms and acronyms, only when the diagram has them | arc42 §12 |

Writing rules in the prompt (`agent/prompt.ts`):

- **Grounded in the canvas.** Chapters use the exact node labels (bold at first mention, with the
  technology), and the first column of every table holds those labels, so each line maps to the
  diagram. Anything the diagram does not show (targets, regions, volumes, costs) is marked
  _Assumption:_ or "to be confirmed".
- **Written for a new team member.** Facts first, short sentences, 60–180 words per text chapter.
- **Scaled to the request.** "A short summary" gives `overview`, `building_blocks` and `runtime`;
  one topic gives one chapter (ADR, risks, security, runbook, SLOs).
- **Fits the diagram type.** Flowcharts get purpose and trigger, steps with their decisions,
  exceptions, roles and inputs/outputs; network diagrams get topology, segments, connectivity,
  security controls and operations.
- **Kept in sync on request.** A diagram edit never rewrites the documentation by itself;
  "update the documentation" rewrites only the stale chapters.

`npm run eval -- --only documentation` scores this against the real model (chapters, tables that
cover every component, ADRs with consequences, risks with mitigations, an appended ADR).

### Pages and history

Pages are added with **+**, renamed with a double-click,
and reordered, duplicated or closed from their **⋮** menu; closing can be undone from the
snackbar.

The **History** panel (right) lists every generated diagram with a thumbnail of how it
looks now and the request that created it. Clicking one shows its page, or reopens it on a
new page if its page was closed or the diagram was replaced. Its **Changes** tab is the undo
history of the current page.

## How edits stay consistent

| Problem in the draw.io fork | What the studio does |
| --- | --- |
| Every change redrew the whole diagram from Mermaid | Gemini edits with `edit_diagram`: typed operations on stable ids (add/update/remove nodes, edges, groups) applied atomically as one undo step |
| Gemini never saw the canvas | Every tool response returns the exact current state (`engine/summary.ts`), including the user's manual edits and selection |
| Positions reshuffled on every change | New nodes are placed next to their neighbours (`engine/placement.ts`). Existing nodes stay where they are, except that inserting between two adjacent nodes shifts the nodes after the insertion to make room. A full ELK layout runs only on create or "tidy up" |
| A wrong guess could wipe the diagram | Batches are validated first and rejected with precise errors; removing more than a third of the diagram needs `confirm_large_removal`; `create_diagram` over an existing diagram needs `new_page` (keeps it) or `replace` |
| Documentation would cover the diagram | Documentation lives in its own tab as a book of chapters (`engine/book.ts`, `ui/DocView.tsx`); the canvas only shows the diagram |
| Spoken names did not match ids | "the database", "payment thing" resolve to ids by label, technology or kind (`engine/resolve.ts`) |

The prompt (`agent/prompt.ts`) is a professional "diagram architect" persona with
conventions for architecture, flowchart, C4 and network diagrams and worked examples of
multi-turn edits.

## API key security

The browser never gets the Gemini API key. The studio uses
[ephemeral tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens), which is what
Google recommends for Live API apps that run in the browser:

```text
page ── POST /api/live/token ──▶ studio server (has the key) ── x-goog-api-key ──▶ Google auth_tokens
page ◀──────── single-use token ───────┘
page ── wss …BidiGenerateContentConstrained?access_token=… ──▶ Gemini Live
```

| | |
| --- | --- |
| Key storage | `./studio.sh key` saves the key in the macOS Keychain, passing it through stdin so it never shows in a process list. Without a Keychain it goes to `.env.local` (git-ignored, mode 600). `GEMINI_API_KEY` in the environment takes precedence (CI, or Cloud Run with Secret Manager). A key saved in the browser by an earlier version is deleted on load. |
| Tokens | One per connection. A token can start one session within 60 s, expires after 30 min, and is locked to the model, voice, system instruction and tools (`server/liveToken.ts`). A resumed session fetches a new token. |
| Token API | Served by the Vite dev and preview servers, on 127.0.0.1 only. It accepts only same-origin requests to an allowed host name, which blocks cross-site requests and DNS rebinding. Request bodies are JSON, at most 2 KB, with allow-listed models and voices. The limit is 10 tokens per minute per client, and responses send `Cache-Control: no-store`. The key goes to Google in a header, never in a URL, and never appears in a response or a log line. |
| Bundle | Only `VITE_*` variables reach the page, so never give a secret a `VITE_` name. |

`STUDIO_LIVE_MODELS` (comma-separated) limits the models that tokens can be issued for.
`STUDIO_ALLOWED_HOSTS` adds host names besides loopback, for a deployment.

In Google AI Studio / Cloud Console:

- Restrict the key to the Generative Language API.
- Set a quota or a budget alert.
- Use a separate key for each environment.
- Rotate the key: run `./studio.sh key`, then delete the old key at aistudio.google.com/apikey.

`./studio.sh check` tests the whole path, including that a used token is refused.

## Sign-in and daily allowances

Locally, the key's owner is the only user, so the studio needs no sign-in. A deployment does:
every Live session spends the studio's Gemini key, so only signed-in users get tokens, and only
as many per day as their plan allows (`server/auth.ts`, `server/usage.ts`, `server/access.ts`).

```text
page ── Sign in with Google ──▶ Google ID token ── POST /api/auth/google ──▶ server verifies it
page ◀──── HttpOnly session cookie (signed, 7 days) ────┘
page ── POST /api/live/token (cookie) ──▶ signed in? sessions left today? ──▶ single-use token
```

| | |
| --- | --- |
| Sign-in | Google Identity Services. The server checks the ID token's signature against Google's keys, its issuer, its audience (the studio's OAuth client, so a token minted for another app is refused), its expiry and that the e-mail is verified. The session is a signed `__Host-` cookie (HttpOnly, Secure, SameSite=Lax); the page never holds a credential. |
| Allowance | One session = one Live token (a connection of at most 30 minutes; a resumed conversation takes another). Free: 20 a day, Pro: 300, owners unlimited, and 1,500 a day for the whole studio. Counters live in Firestore per UTC day (`studio_usage`), shared by all instances; a TTL deletes old days. A token Google fails to issue is given back. |
| Fails closed | On Cloud Run, sign-in is required (`STUDIO_AUTH=google`). Without `GOOGLE_CLIENT_ID` and `SESSION_SECRET`, no tokens are issued at all. |
| Rate limit | Per client IP, from the X-Forwarded-For entry Cloud Run appends (the entries before it are written by the client and ignored); `TRUST_PROXY=2` with a load balancer in front. |
| Stored | `studio_users/{google id}`: name, e-mail, picture, plan, sign-in times. Diagrams stay in the browser. |

| Variable | Default | |
| --- | --- | --- |
| `STUDIO_AUTH` | `google` on Cloud Run, else `off` | `off` disables sign-in |
| `GOOGLE_CLIENT_ID` | — | OAuth web client id(s), comma-separated |
| `SESSION_SECRET` | — | ≥ 32 characters, from Secret Manager |
| `STUDIO_ALLOWED_EMAILS` | everyone | addresses or `@domain`s that may sign in |
| `STUDIO_OWNER_EMAILS` | — | unlimited sessions |
| `STUDIO_FREE_DAILY_SESSIONS` / `STUDIO_PRO_DAILY_SESSIONS` / `STUDIO_DAILY_SESSIONS_TOTAL` | 20 / 300 / 1500 | |
| `STUDIO_USAGE_STORE` | `firestore` on Cloud Run, else `memory` | |

To give someone Pro, set `plan: "pro"` on their `studio_users` document.

## Layout of the code

```text
src/engine/   scene model, edit operations, placement, ELK layout, routing, history (no UI),
              documentation chapters and their Markdown (book.ts: contents, Markdown export),
              workspace (pages, diagram or documentation view, diagram history)
src/agent/    Gemini Live tools, prompt, tool dispatcher, voice session
src/voice/    Live API WebSocket client and setup, token fetching, microphone and playback
src/ui/       React + React Flow canvas, Material 3 theme and components
server/       token API (the only code that reads the API key), sign-in and daily allowances, Vite plugin, ./studio.sh check
eval/         multi-turn conversations scored against the real Live model
e2e/          browser tests (Playwright with the installed Chrome)
```

## Tests

```bash
npm test                         # engine, token API, Live token authentication, sign-in and allowances (test/auth.test.ts)
npm run dev & npm run e2e        # UI smoke test, voice pipeline against a mock Live server, sign-in flow
STUDIO_URL=http://127.0.0.1:5191/ npm run e2e   # against another server, e.g. `vite preview`
npm run check                    # real API: key → token → session, and the used token is refused
npm run eval                     # real model: accuracy and stability per conversation step
npm run eval -- --model gemini-3.8-live-extended-thinking --only flowchart
```

The eval prints, per step, which checks passed and which existing nodes changed although
the request did not mention them; results are saved in `eval/results/`.

## Deploy to Cloud Run

`server/index.ts` (and `Dockerfile`) serves the production bundle in `dist/` with a strict `Content-Security-Policy`, mounts the token and sign-in API at `/api/live/*` and `/api/auth/*`, requires sign-in, and allows `.run.app` origins (or custom domains listed in `STUDIO_ALLOWED_HOSTS`).

```bash
./cloudrun.sh setup     # once: service account, session secret, IAM, Firestore TTL
./cloudrun.sh deploy    # every release
```

The OAuth client, once (Google Cloud console → **Google Auth Platform**, same project):

1. **Branding**: app name *Voice Diagram Studio*, support e-mail. **Audience**: *External*, then
   **Publish app**, so every Google account can sign in (the default scopes, openid, e-mail and
   profile, need no Google verification).
2. **Clients → Create client → Web application**. Authorized JavaScript origins: the service URLs
   (`https://voice-diagram-studio-ukwgwpzepq-ez.a.run.app`,
   `https://voice-diagram-studio-796921467904.europe-west4.run.app`) and, to try sign-in locally,
   `http://localhost` and `http://localhost:5173`. No redirect URI and no client secret are used.
3. `GOOGLE_CLIENT_ID=<client id> STUDIO_OWNER_EMAILS=you@example.com ./cloudrun.sh deploy`
   (later deploys keep both).

To try sign-in locally: `STUDIO_AUTH=google GOOGLE_CLIENT_ID=… SESSION_SECRET=$(openssl rand -hex 32) npm run dev`, then open http://localhost:5173.

## Next

- Official AWS, Azure and Kubernetes SVG icon packs alongside the bundled Google Cloud icon set
- Sequence, ER/class, state and mind map diagrams; Mermaid and .drawio import

## License

Source code is licensed under the [MIT License](../LICENSE). Google Cloud icons in `public/gcp-icons/` remain trademarks and property of Google LLC.
