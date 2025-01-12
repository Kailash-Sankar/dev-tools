import { Panel, PanelWrapper } from '@/layout/styled';
import { SketchPicker, CirclePicker, SwatchesPicker, SliderPicker, CompactPicker } from 'react-color'
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
import ReactJson from 'react-json-view'

const colorAtom = atomWithStorage(atomKeys.colorPicker, '#FFA500');


const Picker = () => {
    const [color, setColor] = useAtom(colorAtom);

    const handleChange = (color: any) => {
        setColor(color);
    }

    console.log('color', color);

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
                            { typeof color === 'object' ? (
                                <ReactJson src={color} theme="monokai" />
                            ) : '....'}
                        </CardContent>
                    </Card>
                </Panel>
            </PanelWrapper>
        </>

    )
}

export default Picker;