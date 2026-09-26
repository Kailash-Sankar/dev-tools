import { useCallback, useEffect, useRef, useState } from "react";

/**
 * `useState` that persists to localStorage, debounced.
 *
 * The tools previously used jotai's `atomWithStorage`, which writes to
 * localStorage synchronously on *every keystroke*. Past a few KB that is a
 * synchronous JSON.stringify + disk write per character, which is the main
 * reason typing felt sluggish on large inputs -- and it blocks the main thread
 * so the textarea stutters.
 *
 * Writes are now debounced, and large values are kept out of localStorage
 * entirely (browsers cap it around 5 MB and a QuotaExceededError mid-typing
 * is a bad failure mode). The in-memory value still updates synchronously, so
 * the input stays fully controlled and the caret never jumps.
 */
const LARGE_VALUE_LIMIT = 512 * 1024; // don't persist beyond this

export function usePersistentState(
  key: string,
  initialValue = "",
  { debounceMs = 400 }: { debounceMs?: number } = {}
) {
  const [value, setValue] = useState<string>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? initialValue : stored;
    } catch {
      return initialValue;
    }
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(value);
  latest.current = value;

  // Persist on unmount too, so a pending value is never lost on navigation.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (typeof window === "undefined") return;
    if (value.length > LARGE_VALUE_LIMIT) {
      // Too big to persist. Drop any previously stored copy so we don't
      // leave a stale value behind that would be restored next visit.
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* storage unavailable (private mode / disabled) -- non-fatal */
      }
      return;
    }

    timer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(key, latest.current);
      } catch {
        /* QuotaExceededError -- state still works in memory */
      }
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [key, value, debounceMs]);

  // Flush synchronously on unmount so debounced writes aren't lost.
  useEffect(
    () => () => {
      if (typeof window === "undefined") return;
      const pending = latest.current;
      if (pending.length > LARGE_VALUE_LIMIT) return;
      try {
        window.localStorage.setItem(key, pending);
      } catch {
        /* non-fatal */
      }
    },
    [key]
  );

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset] as const;
}
