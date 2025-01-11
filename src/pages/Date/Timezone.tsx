import { useMemo, useState } from 'react';
import { Panel, PanelWrapper } from '@/layout/styled';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { format } from "date-fns-tz";
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Check, Pencil, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ZoneBlock from './ZoneBlock';
import { atomWithStorage } from 'jotai/utils';
import { atomKeys } from '@/utils/atomKeys';

const zoneAtomA = atomWithStorage(atomKeys.dateZoneA, 'UTC');
const zoneAtomB = atomWithStorage(atomKeys.dateZoneB, 'Asia/Kolkata');
const zoneAtomC = atomWithStorage(atomKeys.dateZoneC, 'Etc/GMT-8');
const zoneAtomD = atomWithStorage(atomKeys.dateZoneD, 'PST8PDT');

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

    const handleChange = (e: any) => {
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
                            <CardContent key='edit-view' className='flex flex-row gap-2'>
                                <Input className='text-base text-teal-400' defaultValue={formattedDate} onChange={handleChange} />
                                <Button key='check' variant="outline" size="icon" onClick={applyDate}>
                                    <Check size={14} />
                                </Button>

                                <Button key='close' variant="outline" size="icon" onClick={toggleEdit}>
                                    <X size={14} />
                                </Button>
                            </CardContent>
                        ) : (
                            <CardContent key='read-view' className='flex flex-row gap-2'>
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
                <Panel key='tz-1'>
                    <ZoneBlock date={date} zoneAtom={zoneAtomA} />
                </Panel>
                <Panel key='tz-2'>
                    <ZoneBlock date={date} zoneAtom={zoneAtomB} />
                </Panel>
                <Panel key='tz-3'>
                    <ZoneBlock date={date} zoneAtom={zoneAtomC} />
                </Panel>
                <Panel key='tz-4'>
                    <ZoneBlock date={date} zoneAtom={zoneAtomD} />
                </Panel>
            </PanelWrapper>
        </>
    )
}

export default Timezone;