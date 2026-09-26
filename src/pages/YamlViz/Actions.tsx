import { clearState, setHideBackgroundNodes, setHighlightOnHover, useGraphStore } from "./state";
import { Button } from "@/components/ui/button";
import NodeSearch from "./NodeSearch";

type ActionsProps = {
    handleSearch: () => void;
    resetCamera: () => void;
    forceRefresh: () => void;
};

const Actions = ({ resetCamera, forceRefresh }: ActionsProps) => {
    const { highlightOnHover, hideBackgroundNodes } = useGraphStore();

    const handleClear = () => {
        clearState();
        forceRefresh();
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm">Actions</span>
            <NodeSearch />
            <div className="flex flex-wrap gap-2">
                <Button onClick={resetCamera}>Reset Camera</Button>
                <Button
                    onClick={() => setHighlightOnHover(!highlightOnHover)}
                    variant={highlightOnHover ? "default" : "secondary"}
                >
                    Hover Highlight
                </Button>
                <Button
                    onClick={() => setHideBackgroundNodes(!hideBackgroundNodes)}
                    variant={hideBackgroundNodes ? "default" : "secondary"}
                >
                    Hide Background Nodes
                </Button>
                <Button onClick={handleClear} variant="destructive">
                    Clear State
                </Button>
            </div>
        </div>
    );
};

export default Actions;
