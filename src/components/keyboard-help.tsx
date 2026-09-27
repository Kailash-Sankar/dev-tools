import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHelpDialog } from "./help-dialog-context";
import { modLabel } from "@/utils/platform";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["mod", "K"], label: "Open command palette" },
  { keys: ["T"], label: "Toggle light / dark theme" },
  { keys: ["/"], label: "Focus the main input" },
  { keys: ["G", "H"], label: "Go home" },
  { keys: ["?"], label: "This help" },
  { keys: ["Esc"], label: "Close / blur" },
];

/**
 * `?` opens this. Open state lives in {@link useHelpDialog} so the global
 * keyboard handler can dismiss it when the user activates a shortcut it lists.
 */
export function KeyboardHelp() {
  const { open, setOpen } = useHelpDialog();
  const mod = modLabel();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Keyboard shortcuts</DialogTitle>
          <DialogDescription className="text-xs">
            Single-key shortcuts are ignored while typing in a field. Using one
            here closes this panel.
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.label} className="contents">
              <dt className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="bg-surface-2 text-fg-muted rounded border px-1.5 py-0.5 font-mono text-[11px]"
                  >
                    {k === "mod" ? mod : k}
                  </kbd>
                ))}
              </dt>
              <dd className="text-fg-muted text-xs">{s.label}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
