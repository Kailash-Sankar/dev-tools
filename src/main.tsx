import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPaletteProvider } from "@/components/command-palette-context";
import { HelpDialogProvider } from "@/components/help-dialog-context";

/**
 * Providers live here, ABOVE <App>, not inside it.
 *
 * App calls useKeyboardShortcuts(), which reads the theme, the command
 * palette and the help dialog from context. If the providers were rendered inside App's JSX, the
 * hooks would run during App's render -- before its own children mount -- and
 * would receive the context *defaults* (a no-op setTheme/togglePalette) rather
 * than the real values. That's a silent failure: the component tree looks
 * correct and the shortcuts simply do nothing.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <CommandPaletteProvider>
        <HelpDialogProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HelpDialogProvider>
      </CommandPaletteProvider>
    </ThemeProvider>
  </StrictMode>,
)
