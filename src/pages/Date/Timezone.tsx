import { useMemo, useState } from "react";

import { format } from "date-fns-tz";
import { Pencil, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolLayout, ToolPanel } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useToast } from "@/hooks/use-toast";
import ZoneBlock from "./ZoneBlock";

const ZONES = [
  { key: "dateZoneA", fallback: "UTC" },
  { key: "dateZoneB", fallback: "Asia/Kolkata" },
  { key: "dateZoneC", fallback: "Etc/GMT-8" },
  { key: "dateZoneD", fallback: "PST8PDT" },
] as const;

const Timezone = () => {
  const [date, setDate] = useState(() => new Date());
  const [inputDate, setInputDate] = useState("");
  const [edit, setEdit] = useState(false);
  const { toast } = useToast();

  const [zoneA, setZoneA] = usePersistentState("dateZoneA", "UTC");
  const [zoneB, setZoneB] = usePersistentState("dateZoneB", "Asia/Kolkata");
  const [zoneC, setZoneC] = usePersistentState("dateZoneC", "Etc/GMT-8");
  const [zoneD, setZoneD] = usePersistentState("dateZoneD", "PST8PDT");

  const setters = [setZoneA, setZoneB, setZoneC, setZoneD];
  const zones = [zoneA, zoneB, zoneC, zoneD];

  const formattedDate = useMemo(
    () => format(date, "yyyy-MM-dd HH:mm:ssXXX"),
    [date]
  );

  const applyDate = () => {
    const newDate = new Date(inputDate);
    if (Number.isNaN(newDate.getTime())) {
      toast({ title: "Error", description: "Invalid Date", variant: "destructive" });
      return;
    }
    setDate(newDate);
    setEdit(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <ToolLayout className="lg:grid-cols-1 lg:h-auto">
        <ToolPanel
          title="Input Date"
          actions={
            <>
              {edit ? (
                <>
                  <Button size="sm" onClick={applyDate}>Apply</Button>
                  <Button size="icon" variant="outline" onClick={() => setEdit(false)} aria-label="Cancel">
                    <X size={14} />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="icon" variant="outline" onClick={() => { setInputDate(formattedDate); setEdit(true); }} aria-label="Edit date">
                    <Pencil size={16} />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => setDate(new Date())} aria-label="Reset to now">
                    <RefreshCw size={16} />
                  </Button>
                </>
              )}
            </>
          }
        >
          {edit ? (
            <Input
              className="text-base text-teal-400"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              placeholder="2024-01-01T00:00:00Z"
            />
          ) : (
            <p className="font-mono text-lg break-words">{formattedDate}</p>
          )}
        </ToolPanel>
      </ToolLayout>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {ZONES.map(({ key, fallback }, i) => (
          <ZoneBlock
            key={key}
            date={date}
            zone={zones[i]}
            onZoneChange={setters[i]}
            fallback={fallback}
          />
        ))}
      </div>
    </div>
  );
};

export default Timezone;
