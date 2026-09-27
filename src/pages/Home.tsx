import { Link } from "react-router";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";

import { toolGroups, toolList, toolsInGroup } from "@/layout/toolConfig";
import { useCommandPalette } from "@/components/command-palette-context";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { modLabel } from "@/utils/platform";

/**
 * Landing page: a searchable index of every tool, grouped by category.
 *
 * The previous version was a bouncing wordmark with no information in it. A
 * tool index is more useful and gives the ⌘K affordance somewhere to live.
 */
const Home = () => {
  const { toggle: togglePalette } = useCommandPalette();
  const [query, setQuery] = usePersistentState("homeQuery", "");

  const q = query.trim().toLowerCase();
  const matches = (t: (typeof toolList)[number]) =>
    !q ||
    t.title.toLowerCase().includes(q) ||
    (t.keywords ?? []).some((k) => k.toLowerCase().includes(q));

  const groups = toolGroups
    .map((g) => ({ g, tools: toolsInGroup(g).filter(matches) }))
    .filter((x) => x.tools.length > 0);

  const shown = groups.reduce((n, x) => n + x.tools.length, 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          devtools<span className="text-accent-strong">.</span>
        </h1>
        <p className="text-fg-muted max-w-prose text-sm leading-relaxed">
          {toolList.length} small utilities that run entirely in your browser.
          Nothing is uploaded; state lives in localStorage.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={togglePalette}
          className="bg-surface text-fg-muted hover:bg-surface-2 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors"
        >
          <Search className="size-3.5" />
          <span>Search all tools</span>
          <kbd className="bg-surface-2 text-fg-subtle ml-1 rounded border px-1 font-mono text-[10px]">
            {modLabel()}K
          </kbd>
        </button>

        <div className="relative w-full max-w-xs">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter this page…"
            aria-label="Filter tools"
            className="text-fg placeholder:text-fg-subtle bg-surface focus-visible:border-accent-strong h-8 w-full rounded-md border px-3 text-sm outline-none"
          />
        </div>
      </div>

      {shown === 0 ? (
        <p className="text-fg-subtle mt-10 text-sm">
          Nothing matches “{query}”.{" "}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-accent-strong underline underline-offset-2"
          >
            Clear
          </button>
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {groups.map(({ g, tools }) => (
            <section key={g}>
              <h2 className="text-fg-subtle text-[11px] font-medium tracking-wide uppercase">
                {g}
              </h2>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {tools.map((tool) => (
                  <li key={tool.url}>
                    <Link
                      to={tool.url}
                      className="group hover:bg-surface-2 flex items-center gap-2 rounded-md border border-transparent px-2.5 py-2 transition-colors"
                    >
                      <span className="font-mono text-[13px]">{tool.title}</span>
                      {tool.shortcut && (
                        <kbd className="bg-surface-2 text-fg-subtle rounded border px-1 font-mono text-[10px]">
                          {tool.shortcut}
                        </kbd>
                      )}
                      <ArrowRight className="text-fg-subtle ml-auto size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <footer className="text-fg-subtle mt-12 flex items-center gap-2 border-t pt-4 text-xs">
        <ShieldCheck className="size-3.5" />
        <span>
          No API calls, no telemetry. Press <kbd className="font-mono">?</kbd>{" "}
          for keyboard shortcuts.
        </span>
      </footer>
    </div>
  );
};

export default Home;
