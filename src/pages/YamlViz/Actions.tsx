import { clearState, setHideBackgroundNodes, setHighlightOnHover, useGraphStore } from "./state";
import { FlexCol, FlexRow, SectionTitle } from "@/layout/styled";
import { Button } from "@/components/ui/button";
import NodeSearch from "./NodeSearch";

const Actions = ({ resetCamera, forceRefresh }) => {
    const { highlightOnHover, hideBackgroundNodes } = useGraphStore();

    const handleClear = () => {
        clearState();
        forceRefresh();
    }

    return (
        <FlexCol>
            <SectionTitle>Actions</SectionTitle>
            <FlexRow>
                {/* <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find node by label (exact)"
                    style={{ marginBottom: '10px', padding: '4px', width: '200px' }}
                ></Input>
                <Button onClick={handleSearch}>Find</Button>
                <div>|or|</div> */}
                <NodeSearch />
            </FlexRow>
            <FlexRow>

            </FlexRow>
            <FlexRow>
                <Button onClick={resetCamera}>Reset Camera</Button>
                <Button
                    onClick={() => setHighlightOnHover(!highlightOnHover)}
                    variant={ highlightOnHover ? "default" : "secondary"}
                >
                    Hover Highlight
                </Button>
                <Button
                    onClick={() => setHideBackgroundNodes(!hideBackgroundNodes)}
                    variant={ hideBackgroundNodes ? "default" : "secondary"}
                >
                    Hide Background Nodes
                </Button>
                <Button
                    onClick={handleClear}
                    variant="destructive"
                >
                    Clear State
                </Button>
            </FlexRow>
        </FlexCol>
    );
}

export default Actions;
