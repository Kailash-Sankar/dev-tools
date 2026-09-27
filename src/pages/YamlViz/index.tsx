import { Button } from '@/components/ui/button';
import { ToolPanel } from '@/components/tool';
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
    handleRender({ parsedYaml: parseYaml() });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3">
      <div className="grid shrink-0 grid-cols-1 items-start gap-3 lg:grid-cols-2">
        <ToolPanel title="Source">
          <div className="flex flex-wrap items-center gap-2">
            <FileUpload onParsed={handleRender} />
            <span className="text-muted-foreground">or</span>
            <Button onClick={handleClick}>Render Mock</Button>
          </div>
          <Actions
            handleSearch={handleSearch}
            resetCamera={resetCamera}
            forceRefresh={forceRefresh}
          />
        </ToolPanel>

        <Info getNodeInfo={getNodeInfo} />
      </div>

      {/* min-h-0 is what lets the graph shrink instead of overflowing its row. */}
      <div
        className={
          "bg-surface-2 relative min-h-0 flex-1 overflow-hidden rounded-md border " +
          (fullscreen ? "fixed inset-0 z-99 rounded-none" : "")
        }
      >
        <div ref={containerRef} className="h-full w-full min-h-[400px]" />
        <FloatControls />
      </div>
    </div>
  );
};

export default DagViz;
