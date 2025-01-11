import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea"
import { Panel, PanelWrapper, PreWrap } from '@/layout/styled';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"
import { diffLines } from "diff";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


const TextLineDiff = () => {
    const [valueA, setValueA] = useState('');
    const [valueB, setValueB] = useState('');

    const [data, setData] = useState([]);

    const handleChangeA = (e:any) => {
        setValueA(e.target.value);
    }

    const handleChangeB = (e:any) => {
        setValueB(e.target.value);
    }

    const handleClick = () => {
        const diffData:any = diffLines(valueA, valueB);
        setData(diffData);
    }

    return (
        <PanelWrapper>
            <Panel>
                <Card style={{ height: '100%' }}>
                    <CardHeader>
                        <CardTitle>Input</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea rows={15} placeholder="Paste Text A" onChange={handleChangeA} />
                        <Separator className='m-2' />
                        <Textarea rows={15} placeholder="Paste Text B" onChange={handleChangeB} />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleClick}>Diff</Button>
                    </CardFooter>
                </Card>
            </Panel>
            <Panel>
                <Card style={{ height: '100%' }}>
                    <CardHeader>
                        <CardTitle>Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.length > 0 ? (
                            <PreWrap>
                                {data.map((part:any, index) => {
                                    const style = {
                                        color: part.added ? "green" : part.removed ? "red" : "white",
                                        textDecoration: part.removed ? "line-through" : "none",
                                    };
                                    return (
                                        <span key={index} style={style}>
                                            {part.value}
                                        </span>
                                    );
                                })}
                            </PreWrap>
                        ) : (
                            <p>No differences or invalid input.</p>
                        )}
                    </CardContent>
                </Card>
            </Panel>
        </PanelWrapper>


    )
}

export default TextLineDiff;