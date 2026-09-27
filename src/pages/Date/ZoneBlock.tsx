import { memo, useMemo } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { formatInTimeZone } from "date-fns-tz";

// `Intl.supportedValuesOf` is ES2022+ and not yet in the bundled lib.dom types.
const zoneList: string[] = (
  Intl as unknown as { supportedValuesOf(key: "timeZone"): string[] }
).supportedValuesOf("timeZone");

type ZoneBlockProps = {
    date: Date;
    zone: string;
    onZoneChange: (zone: string) => void;
    fallback: string;
};

const ZoneBlock = memo(({ date, zone, onZoneChange, fallback }: ZoneBlockProps) => {
    const formattedZonedDate = useMemo(
        () => formatInTimeZone(date, zone, "yyyy-MM-dd HH:mm:ssXXX"),
        [date, zone]
    );

    return (
        <Card className="flex min-w-0 flex-col overflow-hidden">
            <CardHeader className="shrink-0 py-3">
                <CardTitle className="text-sm">
                    <Select onValueChange={onZoneChange} value={zone || fallback}>
                        <SelectTrigger className="w-full" aria-label="Timezone">
                            <SelectValue placeholder="Select Timezone" />
                        </SelectTrigger>
                        <SelectContent>
                            {zoneList.map((zoneName) => (
                                <SelectItem key={zoneName} value={zoneName}>{zoneName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-auto">
                <Label className="text-accent-strong text-base break-words [overflow-wrap:anywhere]">
                    {formattedZonedDate}
                </Label>
            </CardContent>
        </Card>
    );
});

ZoneBlock.displayName = 'ZoneBlock';

export default ZoneBlock;
