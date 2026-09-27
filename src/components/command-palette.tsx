import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Check,
  Copy,
  Moon,
  Palette,
  Sun,
  Wrench,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toolGroups, toolList, toolsInGroup } from "@/layout/toolConfig";
import { useCommandPalette } from "./command-palette-context";
import { useTheme } from "./theme-provider";
import { modLabel } from "@/utils/platform";

/**
 * ⌘K / Ctrl-K palette: jump to any tool, or run a global action.
 *
 * Built on the cmdk <Command> primitive already in the project, so fuzzy
 * matching and full keyboard navigation come for free. Search matches title
 * plus the `keywords` in toolConfig, so "b64", "url" and "timestamp" all work.
 */
export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const groups = useMemo(
    () =>
      toolGroups
        .map((g) => ({ g, tools: toolsInGroup(g) }))
        .filter((x) => x.tools.length > 0),
    []
  );

  const go = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked (insecure context / denied) */
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Search tools and run actions"
      className="sm:max-w-[30rem]"
    >
      <CommandInput placeholder="Search tools or actions…" />
      <CommandList>
        <CommandEmpty>No matching tools.</CommandEmpty>

        {groups.map(({ g, tools }) => (
          <CommandGroup key={g} heading={g}>
            {tools.map((tool) => (
              <CommandItem
                key={tool.url}
                value={`${tool.title} ${(tool.keywords ?? []).join(" ")}`}
                onSelect={() => go(tool.url)}
                className="gap-2"
              >
                <Wrench className="text-fg-subtle size-3.5 shrink-0" />
                <span className="font-mono text-[13px]">{tool.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandGroup heading="Actions">
          <CommandItem
            value="toggle theme appearance light dark"
            onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="gap-2"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-3.5" />
            ) : (
              <Moon className="size-3.5" />
            )}
            <span>
              Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
            </span>
            <kbd className="bg-surface-2 text-fg-subtle ml-auto rounded border px-1 font-mono text-[10px]">
              T
            </kbd>
          </CommandItem>

          {theme === "system" && (
            <CommandItem
              value="follow system theme appearance"
              onSelect={() => setTheme("system")}
              className="gap-2"
            >
              <Palette className="size-3.5" />
              <span>Follow system theme</span>
            </CommandItem>
          )}

          <CommandItem value="copy link url current" onSelect={copyUrl} className="gap-2">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Link copied" : "Copy link to this tool"}</span>
          </CommandItem>

          <CommandItem
            value="home go home start"
            onSelect={() => go("/")}
            className="gap-2"
          >
            <ArrowRight className="size-3.5" />
            <span>Go home</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      <div className="text-fg-subtle border-t px-3 py-1.5 font-mono text-[11px]">
        <span className="mr-3">↑↓ navigate</span>
        <span className="mr-3">↵ select</span>
        <span className="mr-3">esc close</span>
        <span>
          {toolList.length} tools · {modLabel()}K
        </span>
      </div>
    </CommandDialog>
  );
}
