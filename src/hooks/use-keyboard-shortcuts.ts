import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useCommandPalette } from "@/components/command-palette-context";
import { useTheme } from "@/components/theme-provider";
import { toolList } from "@/layout/toolConfig";
import { isModKey } from "@/utils/platform";

/**
 * Global keyboard shortcuts.
 *
 * Deliberately conservative: single-key shortcuts (t, /) are ignored while
 * typing in a field, because these tools are mostly one big textarea and
 * hijacking "t" would break normal input. Anything that would scroll or
 * navigate away also steps aside when a modifier is held.
 *
 *   ⌘K / Ctrl-K   open the command palette
 *   t             toggle light/dark theme
 *   ?             keyboard help
 *   1-9           jump to a numbered tool
 *   /             focus the page's first input
 *   g then h      go home
 *   Esc           close overlays (handled by the dialogs themselves)
 */
export function useKeyboardShortcuts() {
  const { toggle: togglePalette } = useCommandPalette();
  const { setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    let pendingG = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const isTypingTarget = (t: EventTarget | null): boolean => {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable === true
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl-K works everywhere, including inside inputs.
      if (isModKey(e) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
        return;
      }

      // Any other modifier combination belongs to the browser or the OS.
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (isTypingTarget(e.target)) return;

      // `g` prefix chord: g then h -> home. Times out so a stray g doesn't
      // leave the chord armed indefinitely.
      if (pendingG) {
        pendingG = false;
        if (gTimer) clearTimeout(gTimer);
        if (e.key === "h") {
          e.preventDefault();
          navigate("/");
          return;
        }
      }
      if (e.key === "g") {
        pendingG = true;
        gTimer = setTimeout(() => {
          pendingG = false;
        }, 1200);
        return;
      }

      if (e.key === "t") {
        e.preventDefault();
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("devtools:show-help"));
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const input = document.querySelector<HTMLElement>(
          "textarea, input:not([type=file]), [contenteditable=true]"
        );
        input?.focus();
        return;
      }

      if (e.key === "Escape") {
        // Let dialogs handle their own dismissal; only blur inputs here.
        const active = document.activeElement as HTMLElement | null;
        if (isTypingTarget(active)) active?.blur();
        return;
      }

      // Number keys jump to tools that declared a shortcut.
      if (/^[1-9]$/.test(e.key)) {
        const tool = toolList.find((t) => t.shortcut === e.key);
        if (tool) {
          e.preventDefault();
          navigate(tool.url);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [togglePalette, setTheme, resolvedTheme, navigate]);
}
