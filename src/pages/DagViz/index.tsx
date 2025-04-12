import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Panel, PanelWrapper } from '@/layout/styled';
import useGraph from './useGraph';
import Info from './Info';
import Actions from './Actions';

const DagViz = () => {
    const { containerRef, handleRender, handleSearch, resetCamera } = useGraph();

    const handleClick = () => {
        handleRender();
    }

    return (
        <>
            <PanelWrapper>
                <Panel>
                    <Card style={{ height: '100%' }}>
                        <CardHeader>
                            <div>
                            <div>TBD input file</div>
                            <Button onClick={handleClick}>Render</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Actions handleSearch={handleSearch} resetCamera={resetCamera} />
                        </CardContent>
                        <CardFooter>
                        </CardFooter>
                    </Card>
                </Panel>
                <Panel>
                    <Info />
                </Panel>
            </PanelWrapper>
            <PanelWrapper>
                <Panel>
                    <Card style={{ height: '100%', background: 'snow' }}>
                        <CardHeader>
                            <CardTitle>Output</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 600 }} />
                        </CardContent>
                    </Card>
                </Panel>
            </PanelWrapper>
        </>
    )
}

export default DagViz;