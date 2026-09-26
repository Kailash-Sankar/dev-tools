import type React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Panel, PanelWrapper, PreWrap } from '@/layout/styled';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"
import { diffJson } from "diff";
import type { Change } from "diff"

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { atomKeys } from '@/utils/atomKeys';

const dataAtom = atomWithStorage(atomKeys.JSONDiffOut, []);
const valueAtomA = atomWithStorage(atomKeys.JSONDiffA, '');
const valueAtomB = atomWithStorage(atomKeys.JSONDiffB, '');

const JSONDiff = () => {
    const [valueA, setValueA] = useAtom(valueAtomA);
    const [valueB, setValueB] = useAtom(valueAtomB);

    const [data, setData] = useAtom(dataAtom);

    const handleChangeA = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValueA(e.target.value);
    }

    const handleChangeB = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValueB(e.target.value);
    }

    const handleClick = () => {
        const diffData: Change[] = diffJson(valueA, valueB);
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
                        <Textarea rows={15} placeholder="Paste JSON A" onChange={handleChangeA} defaultValue={valueA} />
                        <Separator className='m-2' />
                        <Textarea rows={15} placeholder="Paste JSON B" onChange={handleChangeB} defaultValue={valueB} />
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
                                {data.map((part: Change, index) => {
                                    const color = part.added
                                        ? "green"
                                        : part.removed
                                            ? "red"
                                            : "white";
                                    return (
                                        <span key={index} style={{ color }}>
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

export default JSONDiff;