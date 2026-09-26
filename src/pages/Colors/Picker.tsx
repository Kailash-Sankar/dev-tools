import { Panel, PanelWrapper } from '@/layout/styled';
import { SketchPicker, CirclePicker, SwatchesPicker, SliderPicker, CompactPicker } from 'react-color'
import type { ColorResult } from 'react-color'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { atomWithStorage } from 'jotai/utils';
import { atomKeys } from '@/utils/atomKeys';
import { useAtom } from 'jotai';
import { Separator } from '@/components/ui/separator';
import { JsonView, darkStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

const colorAtom = atomWithStorage(atomKeys.colorPicker, '#FFA500');


const Picker = () => {
    const [color, setColor] = useAtom(colorAtom);

    const handleChange = (next: ColorResult) => {
        setColor(next);
    }

    const isColorResult = typeof color === 'object' && color !== null;

    return (
        <>
            <PanelWrapper>
                <Panel>
                    <Card style={{ height: '100%', minWidth: 300 }}>
                        <CardContent className='p-5'>
                            <SketchPicker color={color} onChangeComplete={handleChange} width='94%' />
                        </CardContent>
                    </Card>
                </Panel>
                <Panel>
                    <Card style={{ height: '100%', minWidth: 300 }}>
                        <CardContent className='p-5'>
                            <CirclePicker color={color} onChangeComplete={handleChange} />
                            <Separator className='m-5' />
                            <CompactPicker color={color} onChangeComplete={handleChange} />
                            <Separator className='m-5' />
                            <SliderPicker color={color} onChangeComplete={handleChange} />
                        </CardContent>
                    </Card>
                </Panel>
                <Panel>
                    <Card style={{ height: '100%', minWidth: 300 }}>
                        <CardContent className='p-5 justify-center items-center flex h-full'>
                            <SwatchesPicker height={350} color={color} onChangeComplete={handleChange} />
                        </CardContent>
                    </Card>
                </Panel>
            </PanelWrapper>
            <PanelWrapper>
                <Panel>
                    <Card style={{ height: '100%', minWidth: 300 }}>
                        <CardHeader>
                            <CardTitle>Output</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isColorResult ? (
                                <JsonView data={color} style={darkStyles} />
                            ) : (
                                <pre className="overflow-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-sm">
                                    {String(color)}
                                </pre>
                            )}
                        </CardContent>
                    </Card>
                </Panel>
            </PanelWrapper>
        </>

    )
}

export default Picker;