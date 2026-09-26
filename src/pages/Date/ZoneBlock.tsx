import React, { useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { formatInTimeZone } from "date-fns-tz";
import { useAtom } from "jotai";
import type { Atom } from "jotai";

// `Intl.supportedValuesOf` is ES2022+ and not yet in the bundled lib.dom types.
const zoneList: string[] = (
  Intl as unknown as { supportedValuesOf(key: "timeZone"): string[] }
).supportedValuesOf("timeZone");

type ZoneBlockProps = {
    date: Date;
    zoneAtom: Atom<string>;
};

const ZoneBlock = React.memo(({ date, zoneAtom }: ZoneBlockProps) => {
    const [zone, setZone] = useAtom(zoneAtom);

    const handleChange = (value: string) => {
        setZone(value);
    }

    const formattedZonedDate = useMemo(() => {
        return formatInTimeZone(date, zone, "yyyy-MM-dd HH:mm:ssXXX");
    }, [date, zone]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>
                    <Select onValueChange={handleChange} value={zone}>
                        <SelectTrigger className="w-[180px]">
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
            <CardContent>
                <Label className='text-lime-500 text-base break-words'>{formattedZonedDate}</Label>
            </CardContent>
        </Card>
    );
});

ZoneBlock.displayName = 'ZoneBlock';

export default ZoneBlock;
