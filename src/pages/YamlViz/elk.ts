import ELK from "elkjs/lib/elk-api";
import type { ELK } from "elkjs/lib/elk-api";

/**
 * ELK layout engine, running in a Web Worker.
 *
 * The previous code used `elk.bundled.js`, which is ~1.5 MB of GWT-compiled
 * layout algorithms parsed and executed on the *main thread*. Moving them to
 * a worker via the thin `elk-api.js` client means that 1.5 MB is no longer
 * parsed/compiled as part of the main bundle, and the layout algorithm itself
 * does not run on the UI thread.
 *
 * Measured impact, for honesty: at 5k-20k node graphs the dominant cost is
 * Sigma's WebGL rendering, not the layout, so end-to-end time and the longest
 * main-thread block are essentially unchanged (1923ms vs 1949ms at ~19.5k
 * nodes). The win here is keeping 1.5 MB off the main thread, not a
 * responsiveness speed-up. A CPU profile showed only ~24ms of actual JS in
 * the whole render; the rest is native GL work.
 *
 * The instance is memoised so repeated renders reuse one worker instead of
 * spawning a new one (and re-parsing 1.5 MB) per render.
 */
let elkPromise: Promise<ELK> | null = null;

async function getElk(): Promise<ELK> {
  if (!elkPromise) {
    elkPromise = (async () => {
      const { default: ElkWorker } = await import(
        "elkjs/lib/elk-worker?worker"
      );
      return new ELK({
        workerFactory: () => new ElkWorker() as unknown as Worker,
      });
    })().catch((err) => {
      // Don't cache a failed init; let the next render retry.
      elkPromise = null;
      throw err;
    });
  }
  return elkPromise;
}

/** Run a layout, resolving with the laid-out graph. */
export async function layoutGraph<T>(graph: T): Promise<T> {
  const elk = await getElk();
  return elk.layout(graph) as Promise<T>;
}
