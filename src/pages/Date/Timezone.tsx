import React, { useMemo, useState } from 'react';
import { Panel, PanelWrapper } from '@/layout/styled';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { format, formatInTimeZone } from "date-fns-tz";
import { Input } from "@/components/ui/input"

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
import { Check, Pencil, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const zoneList = (Intl as any).supportedValuesOf("timeZone");

const Timezone = () => {
    const [date, setDate] = useState(new Date());
    const [inputDate, setInputDate] = useState('');
    const [edit, setEdit] = useState(false);
    const { toast } = useToast()


    const formattedDate = useMemo(() => format(date, "yyyy-MM-dd HH:mm:ssXXX"), [date]);

    const refreshDate = () => {
        setDate(new Date());
    }

    const toggleEdit = () => {
        setEdit(v => !v);
    }

    const handleChange = (e:any) => {
        setInputDate(e.target.value);
    }

    const applyDate = () => {
        console.log('input', inputDate);
        const newDate = new Date(inputDate);
        console.log('new date', newDate);
        if (newDate.toString() === 'Invalid Date') {
            toast({
                title: 'Error',
                description: 'Invalid Date',
            });
        } else {
            setDate(newDate);
            toggleEdit();
        }
    }

    return (
        <>
            <PanelWrapper>
                <Panel>
                    <Card style={{ height: '100%' }}>
                        <CardHeader>
                            <CardTitle className='flex flex-row gap-2'>
                                System Date

                            </CardTitle>
                        </CardHeader>

                        {edit ? (
                            <CardContent className='flex flex-row gap-2'>
                                <Input className='text-base text-teal-400' defaultValue={formattedDate} onChange={handleChange} />
                                <Button key='check' variant="outline" size="icon" onClick={applyDate}>
                                    <Check size={14} />
                                </Button>

                                <Button key='close' variant="outline" size="icon" onClick={toggleEdit}>
                                    <X size={14} />
                                </Button>
                            </CardContent>
                        ) : (
                            <CardContent className='flex flex-row gap-2'>
                                <Label className='text-xl' >{formattedDate}</Label>
                                <Button key='edit' variant="outline" size="icon" onClick={toggleEdit}>
                                    <Pencil size={16} />
                                </Button>
                                <Button key='reset' variant="outline" size="icon" onClick={refreshDate}>
                                    <RefreshCw size={18} />
                                </Button>

                            </CardContent>
                        )
                        }
                    </Card>
                </Panel>
            </PanelWrapper>
            <PanelWrapper>
                <Panel>
                    <ZoneBlock date={date} defaultZone="UTC" />
                </Panel>
                <Panel>
                    <ZoneBlock date={date} defaultZone="Asia/Kolkata" />
                </Panel>
                <Panel>
                    <ZoneBlock date={date} defaultZone="Etc/GMT-8" />
                </Panel>
                <Panel>
                    <ZoneBlock date={date} defaultZone="PST8PDT" />
                </Panel>
            </PanelWrapper>
        </>

    )
}

const ZoneBlock = React.memo(({ date, defaultZone }:any) => {
    const [zone, setZone] = useState(defaultZone);

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
                                <SelectItem value={zone}>{zone}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardTitle>
            </CardHeader>
            <CardContent>

                <Label className='text-lime-500'>{formattedZonedDate}</Label>
            </CardContent>
        </Card>
    );
});

export default Timezone;