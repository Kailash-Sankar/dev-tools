import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FlexCol, FlexRow, Panel, PanelWrapper } from '@/layout/styled';
import useGraph from './useGraph';
import Info from './Info';
import Actions from './Actions';
import FileUpload from './FileUpload';
import { parseYaml } from './utils';
import FloatControls from './FloatControls';
import { useGraphStore } from './state';

const DagViz = () => {
  const { containerRef, handleRender, handleSearch, resetCamera, forceRefresh, getNodeInfo } = useGraph();
  const { fullscreen } = useGraphStore();

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
              <Actions handleSearch={handleSearch} resetCamera={resetCamera} forceRefresh={forceRefresh} />
            </CardContent>
            <CardFooter>
            </CardFooter>
          </Card>
        </Panel>
        <Panel>
          <Info getNodeInfo={getNodeInfo} />
        </Panel>
      </PanelWrapper>
      <PanelWrapper style={{ flex: 1 }} className={fullscreen ? 'fullscreen' : ''}>
        <Panel style={{ position: 'relative', background: 'snow' }}>
            <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 600 }} />
        </Panel>
        <FloatControls />
      </PanelWrapper>
    </>
  )
}

export default DagViz;
