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

const zoneList = (Intl as any).supportedValuesOf("timeZone");

const ZoneBlock = React.memo(({ date, zoneAtom }:any) => {
    const [zone, setZone]:any = useAtom(zoneAtom);

    console.log('zone block', zone)

    const handleChange = (value:any) => {
        console.log(value);
        setZone(value);
    }
    const formattedZonedDate = useMemo(() => {
        return formatInTimeZone(date, zone, "yyyy-MM-dd HH:mm:ssXXX");
    }, [date, zone]);

    return (
        <Card style={{ height: '100%' }}>
            <CardHeader>
                <CardTitle>
                    <Select onValueChange={handleChange} value={zone}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Timezone" />
                        </SelectTrigger>
                        <SelectContent>
                            {zoneList.map( (zone:any) => (
                                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Label className='text-lime-500 text-base'>{formattedZonedDate}</Label>
            </CardContent>
        </Card>
    );
});

export default ZoneBlock;