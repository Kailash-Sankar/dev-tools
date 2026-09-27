# DevTools

A small collection of browser-based developer tools. Everything runs locally in
the browser — no API calls, no server, no data leaves the page. Tool state is
persisted to `localStorage` (and IndexedDB for the todo list).

## Tools

| Tool | Route | Notes |
| --- | --- | --- |
| JSON Format | `/json-pp` | Parse + collapsible viewer |
| JSON Diff | `/json-diff` | Structural diff of two JSON documents |
| Base64 Encode / Decode | `/b64-encode`, `/b64-decode` | UTF-8 safe (emoji/CJK round-trip) |
| URI Encode / Decode | `/uri-encode`, `/uri-decode` | Lenient decode for malformed `%` sequences |
| Text Diff: Lines / Chars | `/txt-diff-line`, `/txt-diff-char` | |
| Date TZ | `/date-tz` | Compare an instant across four zones |
| Date Epoch | `/date-epoch` | Epoch ↔ human-readable |
| Color Picker | `/color-picker` | hex / rgb / hsl |
| Image Compressor | `/img-compressor` | Resize + re-encode via pica |
| Yaml Viz | `/yaml-viz` | Force-free ELK layout rendered with sigma |
| Todo List | `/todo-list` | IndexedDB with `localStorage` fallback |

## Setup

```bash
pnpm install
pnpm dev        # dev server
pnpm build      # typecheck + production build
pnpm preview    # serve the production build
```

`pnpm check` runs everything the pre-push gate needs:

```bash
pnpm check      # tsc --noEmit + eslint + vitest
```

Individual commands: `pnpm lint`, `pnpm test`, `pnpm test:watch`.

## Adding a tool

1. Create a folder under `src/pages/<Tool>/`.
2. Add an entry to `toolList` in `src/layout/toolConfig.ts` with its `title`
   and `url`.
3. Add the `lazy()` import and `<Route>` in `src/App.tsx`.
4. Add a smoke-test marker in `src/smoke.test.tsx` (the integrity test fails
   until you do, so a tool can't be added silently untested).

There is no per-tool layout code. Build pages from the shared primitives in
`src/components/tool/`:

| Component | Use for |
| --- | --- |
| `ToolLayout` | the page grid — 2 columns, stacks on narrow screens |
| `ToolPanel` | one card: title, scrolling body, footer actions |
| `ToolTextarea` | auto-growing input (grows to content, then scrolls) |
| `ToolOutput` | read-only output; **wraps and scrolls long content** |
| `DiffOutput` | the three diff tools' shared renderer |

### Keyboard

| Key | Action |
| --- | --- |
| `⌘K` / `Ctrl-K` | command palette (tool search + actions) |
| `T` | toggle light / dark |
| `/` | focus the main input |
| `G` then `H` | go home |
| `1`, `2` | jump to numbered tools |
| `?` | keyboard help (toggles) |
| `Esc` | close / blur |

Any shortcut listed in the help panel also dismisses it, so the action is
visible rather than happening behind the modal.

Single-key shortcuts are ignored while typing in a field -- these tools are
mostly one big textarea, so hijacking `t` would break normal input. `⌘K`
works from anywhere, including inside an input.

```tsx
<ToolLayout>
  <ToolPanel title="Input" actions={<Button onClick={run}>Run</Button>}>
    <ToolTextarea value={value} onChange={onChange} placeholder="Paste here" />
  </ToolPanel>
  <ToolPanel title="Output">
    <ToolOutput empty="Result appears here.">{result}</ToolOutput>
  </ToolPanel>
</ToolLayout>
```

Two rules that exist because of past bugs:

- **Use `ToolTextarea`, not a bare `Textarea`.** The old pages hard-coded
  `rows={25}`, so a one-line input and a 5,000-line paste occupied the same
  space and the panel either overflowed the viewport or clipped.
- **Put large output in `ToolOutput`, not a plain `div`.** `white-space:
  pre-wrap` alone does **not** break an unbroken token (base64, minified JSON,
  a long URL) — it only breaks at whitespace that already exists. `ToolOutput`
  adds `overflow-wrap: anywhere`, which is what actually forces the break.

Persist state with `usePersistentState` from `src/hooks/`, not
`atomWithStorage`. The latter writes to `localStorage` synchronously on every
keystroke, which stutters on large inputs.

## Tests

- `src/utils/*.test.ts` — unit tests for the base64/URI codecs and colour maths.
- `src/smoke.test.tsx` — mounts every route in jsdom and asserts a marker
  unique to that page appears. Note the routes are `lazy()`, so these
  assertions are awaited with `findBy*`; a synchronous assertion would only
  ever see the `<Suspense>` skeleton and pass even if a page were broken.

Not covered by tests, and verified manually in headless Chrome instead:
WebGL/canvas rendering, file pickers, clipboard, and layout/wrapping.

## Design system

Colours live in `src/index.css` as OKLCH variables behind semantic names
(`--c-surface`, `--c-accent`, `--c-add`, ...), exposed to Tailwind via
`@theme inline`. Components use `bg-surface` / `text-fg-muted` /
`text-accent-strong` and never a raw colour, so both themes come from one
definition.

Things worth knowing if you add UI:

- The theme class is applied to `<html>` by a pre-paint script in `index.html`
  (and again by React). `src/theme-init.test.ts` keeps the two in sync.
- sigma draws to WebGL and can't read CSS variables, so YamlViz resolves its
  own palette per theme in `graph-theme.ts` and repaints on theme change.
- Providers (`ThemeProvider`, `CommandPaletteProvider`) are mounted in
  `main.tsx`, *above* `App`. Anything in App that reads their context must be
  a descendant of them.

## Stack

Vite 7 · React 19 · TypeScript · Tailwind CSS 4 · Radix UI · shadcn/ui
components in `src/components/ui/`.

The ELK layout engine runs in a Web Worker via `elkjs`'s `elk-api` client.
This keeps ~1.5 MB of layout code off the main thread and out of the initial
bundle. It does **not** measurably improve render time — the bottleneck for
large graphs is sigma's WebGL rendering, not the layout. See the comment in
`src/pages/YamlViz/elk.ts`.
