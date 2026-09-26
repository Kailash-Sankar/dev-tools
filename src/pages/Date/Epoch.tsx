import { useEffect, useMemo, useState } from "react";

import { Check, Pencil, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToolLayout, ToolPanel } from "@/components/tool";
import { useToast } from "@/hooks/use-toast";

const Epoch = () => {
  const { toast } = useToast();
  const [date, setDate] = useState(() => Date.now());
  const [inputDate, setInputDate] = useState("");
  const [edit, setEdit] = useState(false);

  // Keep a live clock on the read view so the tool is useful without clicking.
  useEffect(() => {
    if (edit) return;
    const id = setInterval(() => setDate(Date.now()), 1000);
    return () => clearInterval(id);
  }, [edit]);

  const dtObj = useMemo(() => new Date(date), [date]);

  const applyDate = () => {
    const parsed = parseInt(inputDate, 10);
    if (Number.isNaN(parsed)) {
      toast({ title: "Error", description: "Not a valid epoch value", variant: "destructive" });
      return;
    }
    const d = new Date(parsed);
    if (Number.isNaN(d.getTime())) {
      toast({ title: "Error", description: "Invalid Date", variant: "destructive" });
      return;
    }
    setDate(parsed);
    setEdit(false);
  };

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <>
            {edit ? (
              <>
                <Button size="icon" variant="outline" onClick={applyDate} aria-label="Apply">
                  <Check size={14} />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setEdit(false)} aria-label="Cancel">
                  <X size={14} />
                </Button>
              </>
            ) : (
              <>
                <Button size="icon" variant="outline" onClick={() => { setInputDate(String(date)); setEdit(true); }} aria-label="Edit epoch">
                  <Pencil size={16} />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setDate(Date.now())} aria-label="Reset to now">
                  <RefreshCw size={16} />
                </Button>
              </>
            )}
          </>
        }
      >
        <Badge variant="secondary" className="w-fit">Epoch</Badge>
        {edit ? (
          <Input
            className="text-base text-teal-400"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            inputMode="numeric"
            aria-label="Epoch value"
          />
        ) : (
          <p className="font-mono text-lg break-words [overflow-wrap:anywhere]">{date}</p>
        )}
      </ToolPanel>

      <ToolPanel title="Output">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit">System</Badge>
          <dl className="flex flex-col gap-1 font-mono text-sm">
            <div><dt className="inline text-muted-foreground">toString: </dt><dd className="inline break-words [overflow-wrap:anywhere]">{dtObj.toString()}</dd></div>
            <div><dt className="inline text-muted-foreground">toLocaleString: </dt><dd className="inline break-words [overflow-wrap:anywhere]">{dtObj.toLocaleString()}</dd></div>
          </dl>

          <Separator className="my-2" />

          <Badge variant="secondary" className="w-fit">UTC</Badge>
          <dl className="flex flex-col gap-1 font-mono text-sm">
            <div><dt className="inline text-muted-foreground">toISOString: </dt><dd className="inline break-words [overflow-wrap:anywhere]">{dtObj.toISOString()}</dd></div>
            <div><dt className="inline text-muted-foreground">toUTCString: </dt><dd className="inline break-words [overflow-wrap:anywhere]">{dtObj.toUTCString()}</dd></div>
          </dl>
        </div>
      </ToolPanel>
    </ToolLayout>
  );
};

export default Epoch;
