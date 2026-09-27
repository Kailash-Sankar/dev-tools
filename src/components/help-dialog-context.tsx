import { createContext, useCallback, useContext, useMemo, useState } from "react";

type HelpDialogState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
};

const HelpDialogContext = createContext<HelpDialogState>({
  open: false,
  setOpen: () => null,
  toggle: () => null,
  close: () => null,
});

/**
 * Shared open state for the `?` keyboard-help dialog.
 *
 * It has to be context rather than local state because the global keyboard
 * handler needs to close it: pressing a shortcut that the dialog documents
 * should perform the action *and* dismiss the dialog, otherwise the action
 * happens invisibly behind the modal and the user is left staring at help.
 */
export const useHelpDialog = () => useContext(HelpDialogContext);

export function HelpDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ open, setOpen, toggle, close }), [open, toggle, close]);

  return (
    <HelpDialogContext.Provider value={value}>{children}</HelpDialogContext.Provider>
  );
}
