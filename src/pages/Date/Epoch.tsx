import { useMemo, useState } from 'react';
import { Panel, PanelWrapper } from '@/layout/styled';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Check, Pencil, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge"
import { Separator } from '@/components/ui/separator';

const Epoch = () => {
    const nowEpoch = Date.now();
    const [inputDate, setInputDate] = useState(nowEpoch);
    const [date, setDate] = useState(nowEpoch);

    const [edit, setEdit] = useState(false);
    const { toast } = useToast()

    const dtObj = useMemo(() => new Date(date), [date]);

    const refreshDate = () => {
        setDate(Date.now());
    }

    const toggleEdit = () => {
        setEdit(v => !v);
    }

    const handleChange = (e: any) => {
        setInputDate(e.target.value);
    }

    const applyDate = () => {
        const newEpochDate = parseInt(`${inputDate}`, 10);
        console.log('newEpochDate', newEpochDate);
        if (new Date(newEpochDate).toString() === 'Invalid Date') {
            toast({
                title: 'Error',
                description: 'Invalid Date',
            });
        } else {
            setDate(newEpochDate);
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
                                Input
                            </CardTitle>
                        </CardHeader>
                        <Badge variant="secondary" className='ml-5'>Epoch</Badge>
                        {edit ? (
                            <CardContent key='edit-view' className='flex flex-row gap-2 mt-5'>
                                <Input className='text-base text-teal-400' defaultValue={inputDate} onChange={handleChange} />
                                <Button key='check' variant="outline" size="icon" onClick={applyDate}>
                                    <Check size={14} />
                                </Button>

                                <Button key='close' variant="outline" size="icon" onClick={toggleEdit}>
                                    <X size={14} />
                                </Button>
                            </CardContent>
                        ) : (
                            <CardContent key='read-view' className='flex flex-row gap-2 mt-5'>
                                <Label className='text-xl' >{date}</Label>
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
                <Panel key='tz-1'>
                <Card style={{ height: '100%' }}>
                        <CardHeader>
                        <CardTitle >
                            Output
                        </CardTitle>
                        </CardHeader>
                        <CardContent key='read-view'>
                            <Badge variant="secondary">System</Badge>
                            <div className='flex flex-col gap-2 mt-5'>
                                <Label className='text-xl' >{dtObj.toString()}</Label>
                                <Label className='text-xl' >{dtObj.toLocaleString()}</Label>
                            </div>

                            <Separator className='m-5' />

                            <Badge variant="secondary">UTC</Badge>
                            <div className='flex flex-col gap-2 mt-5'>
                                <Label className='text-xl' >{dtObj.toISOString()}</Label>
                                <Label className='text-xl' >{dtObj.toUTCString()}</Label>
                            </div>
                        </CardContent>
                    </Card>
                </Panel>
            </PanelWrapper>
        </>
    )
}

export default Epoch;