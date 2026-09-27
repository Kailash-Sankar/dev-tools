// @vitest-environment jsdom
/**
 * Keyboard shortcut behaviour.
 *
 * These are the cases that were easy to get wrong and are invisible to the
 * type checker:
 *   - a shortcut acting while a modal is open (it must not fire behind it)
 *   - single-key shortcuts firing while the user is typing
 *   - reading a context default instead of the real provider (a silent no-op)
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import App from "@/App";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPaletteProvider } from "@/components/command-palette-context";
import { HelpDialogProvider } from "@/components/help-dialog-context";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

/** Mirrors main.tsx: providers sit ABOVE App. */
function renderApp(path = "/b64-encode") {
  return render(
    <ThemeProvider>
      <CommandPaletteProvider>
        <HelpDialogProvider>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
          </MemoryRouter>
        </HelpDialogProvider>
      </CommandPaletteProvider>
    </ThemeProvider>
  );
}

const helpDialog = () =>
  screen.queryByRole("dialog", { name: /keyboard shortcuts/i });

describe("keyboard shortcuts", () => {
  it("opens the help dialog with ? and toggles it closed", async () => {
    const user = userEvent.setup();
    renderApp();

    expect(helpDialog()).toBeNull();
    await user.keyboard("{?}");
    await waitFor(() => expect(helpDialog()).not.toBeNull());

    await user.keyboard("{?}");
    await waitFor(() => expect(helpDialog()).toBeNull());
  });

  it("closes the help dialog when a shortcut it lists is used", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.keyboard("{?}");
    await waitFor(() => expect(helpDialog()).not.toBeNull());

    // `1` is documented in the dialog as "JSON Format".
    await user.keyboard("1");

    // The action fires *and* the dialog goes away, so the result is visible.
    await waitFor(() => expect(helpDialog()).toBeNull());
    // The route is lazy(), so wait for its chunk rather than asserting inline.
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Paste JSON here/i)).toBeTruthy()
    );
  });

  it("closes the help dialog when the theme shortcut is used", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.keyboard("{?}");
    await waitFor(() => expect(helpDialog()).not.toBeNull());

    const before = document.documentElement.className;
    await user.keyboard("t");

    await waitFor(() => expect(helpDialog()).toBeNull());
    expect(document.documentElement.className).not.toBe(before);
  });

  it("ignores single-key shortcuts while typing in a field", async () => {
    const user = userEvent.setup();
    renderApp();

    const textarea = screen.getByPlaceholderText(/Paste string to encode/i);
    await user.click(textarea);
    expect(document.activeElement).toBe(textarea);

    // The theme shortcut must not fire while the caret is in the textarea.
    const before = document.documentElement.className;
    await user.keyboard("t");
    expect(document.documentElement.className).toBe(before);
  });

  it("opens the command palette with the platform modifier + K", async () => {
    renderApp();
    // jsdom reports a non-Mac platform, so isModKey() checks ctrlKey.
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
    );
    await waitFor(() =>
      expect(document.querySelector("[cmdk-root]")).not.toBeNull()
    );
  });

  it("does not let the theme toggle when the command palette is open", async () => {
    const user = userEvent.setup();
    renderApp();

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
    );
    await waitFor(() =>
      expect(document.querySelector("[cmdk-root]")).not.toBeNull()
    );

    const before = document.documentElement.className;
    // The palette input holds focus, so single-key shortcuts must be ignored.
    await user.keyboard("t");
    expect(document.documentElement.className).toBe(before);
  });
});
