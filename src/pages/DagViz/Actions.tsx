import { Input } from "@/components/ui/input"
import { setHighlightOnHover, setSearchQuery, useGraphStore } from "./state";
import { FlexRow, SectionTitle } from "@/layout/styled";
import { Button } from "@/components/ui/button";


const Actions = ({ handleSearch, resetCamera }) => {
    const { searchQuery, highlightOnHover } = useGraphStore();

    return (
        <div>
            <SectionTitle>Actions</SectionTitle>
            <FlexRow>
                <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search node by label"
                    style={{ marginBottom: '10px', padding: '4px', width: '200px' }}
                ></Input>
                <Button onClick={handleSearch}>Search</Button>
            </FlexRow>
            <FlexRow>
                <Button onClick={resetCamera}>Reset View</Button>
                <Button 
                    onClick={() => setHighlightOnHover(!highlightOnHover)}
                    variant={ highlightOnHover ? "default" : "secondary"}
                >Hover Highlight</Button>
            </FlexRow>
        </div>
    );
}

export default Actions;