import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea"
import { Panel, PanelWrapper } from '@/layout/styled';
import { Button } from "@/components/ui/button";
import ReactJson from 'react-json-view'

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


const JSONPrettyPrint = () => {
    const [value, setValue] = useState('');
    const [data, setData] = useState({});

    const handleChange = (e) => {
        setValue(e.target.value);
    }

    const handleClick = () => {
       const parsedData = JSON.parse(value);
        setData(parsedData);
    }


    return (
        <PanelWrapper>
            <Panel>
                <Card style={{ height: '100%' }}>
                    <CardHeader>
                        <CardTitle>Input</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea rows={25} placeholder="Paste JSON here" onChange={handleChange} />
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
                        <ReactJson src={data} theme="monokai" />
                    </CardContent>
                </Card>
            </Panel>
        </PanelWrapper>


    )
}

export default JSONPrettyPrint;