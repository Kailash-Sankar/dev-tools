import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea"
import { Panel, PanelWrapper, PreWrap } from '@/layout/styled';
import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


const URIEncode = () => {
    const [value, setValue] = useState('');
    const [data, setData] = useState('');

    const handleChange = (e:any) => {
        setValue(e.target.value);
    }

    const handleClick = () => {
       const encodedData = encodeURIComponent(value);
        setData(encodedData);
    }


    return (
        <PanelWrapper>
            <Panel>
                <Card style={{ height: '100%' }}>
                    <CardHeader>
                        <CardTitle>Input</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea rows={25} placeholder="Paste string to encode" onChange={handleChange} />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleClick}>Format</Button>
                    </CardFooter>
                </Card>
            </Panel>
            <Panel>
                <Card style={{ height: '100%' }}>
                    <CardHeader>
                        <CardTitle>Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PreWrap>{data}</PreWrap>
                    </CardContent>
                </Card>
            </Panel>
        </PanelWrapper>


    )
}

export default URIEncode;