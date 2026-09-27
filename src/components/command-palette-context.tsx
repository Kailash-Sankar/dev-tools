import { createContext, useCallback, useContext, useMemo, useState } from "react";

type CommandPaletteState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteState>({
  open: false,
  setOpen: () => null,
  toggle: () => null,
});

/** Lets any component open the palette without owning it. */
export const useCommandPalette = () => useContext(CommandPaletteContext);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}
