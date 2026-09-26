import { Textarea } from "@/components/ui/textarea"
import { Panel, PanelWrapper } from '@/layout/styled';
import { Button } from "@/components/ui/button";
import { JsonView } from 'react-json-view-lite'
import { darkStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useState } from 'react'

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { atomKeys } from '@/utils/atomKeys';


const dataAtom = atomWithStorage(atomKeys.JSONPrettyPrintOut, {});
const valueAtom = atomWithStorage(atomKeys.JSONPrettyPrintIn, '');

const JSONPrettyPrint = () => {
    const [data, setData] = useAtom(dataAtom);
    const [value, setValue] = useAtom(valueAtom);

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        setError(null);
    }

    const handleClick = () => {
        try {
            setData(JSON.parse(value));
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Invalid JSON');
        }
    }


    return (
        <PanelWrapper>
            <Panel>
                <Card style={{ height: '100%' }}>
                    <CardHeader>
                        <CardTitle>Input</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            rows={25}
                            placeholder="Paste JSON here"
                            onChange={handleChange}
                            value={value}
                            spellCheck={false}
                            className="font-mono"
                        />
                        {error && (
                            <p role="alert" className="mt-2 text-sm text-destructive break-words">
                                {error}
                            </p>
                        )}
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
                        <JsonView data={data} style={darkStyles} />
                    </CardContent>
                </Card>
            </Panel>
        </PanelWrapper>


    )
}

export default JSONPrettyPrint;