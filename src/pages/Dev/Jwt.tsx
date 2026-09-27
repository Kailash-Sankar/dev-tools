import { useMemo } from "react";

import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToolLayout, ToolOutput, ToolPanel, ToolTextarea } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { decodeJwt, timestampClaims } from "@/utils/jwt";
import type { DecodedJwt } from "@/utils/jwt";

const PLACEHOLDER = "Paste a JWT (eyJ...)";

/** Sample token: header {"alg":"HS256","typ":"JWT"}, payload {"sub":"123","name":"Ada"}. */
const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const pretty = (o: unknown) => JSON.stringify(o, null, 2);

const JwtDecoder = () => {
  const [value, setValue] = usePersistentState("tool.jwt.value", "");

  // Decoding is cheap and synchronous, so this recomputes on every keystroke
  // rather than needing a button -- pasting is the whole interaction.
  const { jwt, error } = useMemo((): { jwt: DecodedJwt | null; error: string } => {
    if (!value.trim()) return { jwt: null, error: "" };
    try {
      return { jwt: decodeJwt(value), error: "" };
    } catch (e) {
      return {
        jwt: null,
        error: e instanceof Error ? e.message : "Could not decode.",
      };
    }
  }, [value]);

  const stamps = jwt ? timestampClaims(jwt) : [];

  return (
    <ToolLayout>
      <ToolPanel
        title="Token"
        actions={
          <>
            <Button variant="outline" onClick={() => setValue(SAMPLE)}>
              Sample
            </Button>
            <Button variant="outline" onClick={() => setValue("")} disabled={!value}>
              Clear
            </Button>
          </>
        }
      >
        <ToolTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={PLACEHOLDER}
          aria-label={PLACEHOLDER}
        />

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}

        {jwt && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{jwt.alg ?? "unknown alg"}</Badge>
            {jwt.isExpired && <Badge variant="destructive">expired</Badge>}
            {!jwt.isExpired && jwt.exp !== null && (
              <Badge variant="outline">expires {new Date(jwt.exp * 1000).toLocaleString()}</Badge>
            )}
            {jwt.notYetValid && <Badge variant="destructive">not yet valid (nbf)</Badge>}
          </div>
        )}
      </ToolPanel>

      <ToolPanel
        title="Decoded"
        actions={
          <Button
            variant="outline"
            disabled={!jwt}
            onClick={() => navigator.clipboard?.writeText(pretty(jwt?.payload))}
          >
            Copy claims
          </Button>
        }
      >
        {jwt ? (
          <div className="flex min-h-0 flex-col gap-2">
            <section className="flex min-h-0 flex-col gap-1">
              <h3 className="text-fg-muted text-xs font-medium">Header</h3>
              <ToolOutput>{pretty(jwt.header)}</ToolOutput>
            </section>
            <section className="flex min-h-0 flex-col gap-1">
              <h3 className="text-fg-muted text-xs font-medium">Payload</h3>
              <ToolOutput>{pretty(jwt.payload)}</ToolOutput>
            </section>
            {stamps.length > 0 && (
              <section className="shrink-0">
                <h3 className="text-fg-muted mb-1 text-xs font-medium">Times</h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                  {stamps.map((s) => (
                    <div key={s.claim} className="contents">
                      <dt className="text-fg-muted font-mono">{s.claim}</dt>
                      <dd className="font-mono break-all">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        ) : (
          <ToolOutput empty="Header and claims appear here." />
        )}

        <p className="text-fg-muted flex shrink-0 items-start gap-2 text-xs">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-yellow-500" aria-hidden />
          <span>
            <strong className="text-fg font-medium">Decoding is not verification.</strong> A JWT
            is just base64, so anyone can mint a token claiming any claims. The signature is
            <em> not</em> checked here, because checking it needs the issuer&rsquo;s public key.
            Never trust claims from this tool.
          </span>
        </p>
      </ToolPanel>
    </ToolLayout>
  );
};

export default JwtDecoder;
