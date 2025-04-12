import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FlexCol, FlexRow, Panel, PanelWrapper } from '@/layout/styled';
import useGraph from './useGraph';
import Info from './Info';
import Actions from './Actions';
import FileUpload from './FileUpload';
import { parseYaml } from './utils';

const DagViz = () => {
    const { containerRef, handleRender, handleSearch, resetCamera, focusCameraOnNode, getNodeInfo } = useGraph();

    const handleClick = () => {
        const parsedYaml = parseYaml();
        handleRender({ parsedYaml });
    }

    return (
        <>
            <PanelWrapper>
                <Panel>
                    <Card style={{ height: '100%' }}>
                        <CardHeader>
                            <FlexRow>
                            <FileUpload onParsed={handleRender} />
                            <div>|or|</div>
                            <div><Button onClick={handleClick}>Render Mock</Button></div>
                            </FlexRow>
                        </CardHeader>
                        <CardContent>
                            <Actions handleSearch={handleSearch} resetCamera={resetCamera} />
                        </CardContent>
                        <CardFooter>
                        </CardFooter>
                    </Card>
                </Panel>
                <Panel>
                    <Info getNodeInfo={getNodeInfo} />
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