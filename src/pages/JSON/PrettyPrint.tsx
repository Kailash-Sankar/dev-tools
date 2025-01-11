import { Textarea } from "@/components/ui/textarea"
import { Panel, PanelWrapper } from '@/layout/styled';
import { Button } from "@/components/ui/button";
import ReactJson from 'react-json-view'

import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

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

    const handleChange = (e:any) => {
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
                        <Textarea 
                            rows={25} 
                            placeholder="Paste JSON here" 
                            onChange={handleChange} 
                            defaultValue={value} 
                        />
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