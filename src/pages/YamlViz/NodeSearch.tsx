import { useEffect, useState } from "react";
import { setSelectedNodes, useGraphStore } from "./state";

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


const NodeSearch = () => {
    const { nodeMap } = useGraphStore();
    const [open, setOpen] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!searchQuery) {
            setSuggestions([]);
            return;
        }
        const q = searchQuery.toLowerCase();
        // Cap the result set: a large graph can have thousands of distinct
        // labels, and rendering them all in the popover is what made this
        // sluggish.
        setSuggestions(Object.keys(nodeMap).filter((id) => id.toLowerCase().includes(q)).slice(0, 10));
    }, [searchQuery, nodeMap]);


    const handleSelect = (nodeKey: string) => {
        const nodeIds = nodeMap[nodeKey];

        setSearchQuery(nodeKey);
        setSelectedNodes(new Set(nodeIds));
        setOpen(false);
    }

    return (
        <div className="relative w-64">
            <div className="flex items-center space-x-4">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[250px] justify-start">
                            {(!open && searchQuery) ? <>{searchQuery}</> : <>Search for nodes</>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" side="right" align="start">
                        <Command>
                            <CommandInput placeholder="Search node labels..." onValueChange={setSearchQuery} />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup>
                                    {suggestions.map((nodeLabel) => (
                                        <CommandItem
                                            key={nodeLabel}
                                            value={nodeLabel}
                                            onSelect={handleSelect}
                                        >
                                            {nodeLabel}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

export default NodeSearch;