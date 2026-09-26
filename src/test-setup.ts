/**
 * jsdom environment shims.
 *
 * These are gaps in jsdom, not bugs in the app -- every one of these APIs
 * exists in all current browsers. Only the jsdom smoke test needs them, so
 * everything is guarded on `window` and this file is a no-op under Node.
 */

if (typeof window !== "undefined") {
  // The theme provider calls window.matchMedia to follow the OS colour scheme.
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
  }

  // Radix / cmdk use ResizeObserver for popover positioning.
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }

  // jsdom implements neither of these; several Radix primitives call them.
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
}

export {};
