/**
 * Cron expression parsing and next-run calculation.
 *
 * API note: cron-parser v5 renamed the entry point. The widely-copied
 * `parseExpression()` from v4 no longer exists -- it is now
 * `CronExpressionParser.parse()`. Everything online predates the rename.
 *
 * Timezone note: cron-parser yields Dates in the host's local zone, which is
 * exactly the ambiguity that makes cron debugging painful. The tool always
 * renders the resolved zone alongside the times so the output is never
 * silently "wrong timezone".
 */
import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";

export class CronError extends Error {}

export const CRON_PRESETS: { label: string; expression: string }[] = [
  { label: "Every minute", expression: "* * * * *" },
  { label: "Hourly", expression: "0 * * * *" },
  { label: "Daily at 09:00", expression: "0 9 * * *" },
  { label: "Weekdays at 09:00", expression: "0 9 * * 1-5" },
  { label: "Every Monday", expression: "0 9 * * 1" },
  { label: "First of month", expression: "0 0 1 * *" },
  { label: "Every 15 min", expression: "*/15 * * * *" },
  { label: "Twice a day", expression: "0 0,12 * * *" },
];

export const FIELD_LABELS = ["minute", "hour", "day of month", "month", "day of week"] as const;

export type CronResult = {
  expression: string;
  /** Plain-English description, e.g. "At 09:00 AM, Monday through Friday". */
  description: string;
  /** Next N fire times, in the host's local zone. */
  next: Date[];
  /** IANA zone the times are resolved in. */
  timeZone: string;
};

/**
 * cron-parser and cronstrue disagree on what counts as a valid expression
 * (e.g. 6-field with seconds, or the `@daily` macro). Rather than pick a
 * winner, both are run and the first useful message is surfaced, so an
 * invalid expression always produces a specific error.
 */
export function describeCron(expression: string, count = 5, now: Date = new Date()): CronResult {
  const expr = expression.trim();
  if (!expr) throw new CronError("Enter a cron expression.");

  let description: string;
  try {
    description = cronstrue.toString(expr);
  } catch (e) {
    // A macro like @daily is valid to cron-parser but not to cronstrue;
    // fall through and let the parse decide.
    description = "";
    if (e instanceof Error && !/^@/.test(expr)) {
      throw new CronError(`Not a valid cron expression: ${e.message}`);
    }
  }

  let next: Date[];
  try {
    // v5 API. `currentDate` seeds the iteration so the first result is the
    // next occurrence strictly after `now`, not a time in the past.
    const interval = CronExpressionParser.parse(expr, { currentDate: now });
    next = Array.from({ length: count }, () => interval.next().toDate());
  } catch (e) {
    throw new CronError(
      `Not a valid cron expression: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  return {
    expression: expr,
    description: description || `Cron expression: ${expr}`,
    next,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export const formatRunTime = (d: Date) =>
  d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/** "in 4 minutes" / "2 hours ago" style, relative to now. */
export const formatRelative = (d: Date, now: Date = new Date()) => {
  const deltaSec = Math.round((d.getTime() - now.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, secs] of units) {
    if (Math.abs(deltaSec) >= secs) {
      return rtf.format(Math.round(deltaSec / secs), unit);
    }
  }
  return rtf.format(0, "second");
};
