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
import { atomWithStorage } from 'jotai/utils';
import { atomKeys } from '@/utils/atomKeys';
import { useAtom } from 'jotai';

const valueAtomA = atomWithStorage(atomKeys.textLinesA, '');
const valueAtomB = atomWithStorage(atomKeys.textLinesB, '');
const dataAtom = atomWithStorage(atomKeys.textLinesOut, []);


const TextLineDiff = () => {
    const [valueA, setValueA] = useAtom(valueAtomA);
    const [valueB, setValueB] = useAtom(valueAtomB);

    const [data, setData] = useAtom(dataAtom);

    const handleChangeA = (e:any) => {
        setValueA(e.target.value);
    }

    const handleChangeB = (e:any) => {
        setValueB(e.target.value);
    }

    const handleClick = () => {
        const diffData:any = diffLines(valueA, valueB, { ignoreWhitespace: true });
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
                        <Textarea rows={15} placeholder="Paste Text A" onChange={handleChangeA} defaultValue={valueA} />
                        <Separator className='m-2' />
                        <Textarea rows={15} placeholder="Paste Text B" onChange={handleChangeB} defaultValue={valueB} />
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