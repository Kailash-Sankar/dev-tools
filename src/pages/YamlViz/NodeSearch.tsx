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
    const [suggestions, setSuggestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();

            const filtered = Object.keys(nodeMap).filter((id) =>
                id.toLowerCase().includes(lowerCaseQuery)
            );

            setSuggestions(filtered.slice(0, 10)); // Show max 10 suggestions
        }
    }, [searchQuery, nodeMap]);


    const handleSelect = (nodeKey: string) => {
        const nodeIds = nodeMap[nodeKey];
        console.log('nodeIds', nodeIds);

        setSearchQuery(nodeKey);
        setSelectedNodes(new Set(nodeIds));
    }

    return (
        <div className="relative w-64">
            <div className="flex items-center space-x-4">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[250px] justify-start">
                            {<>Search with autocomplete</>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" side="right" align="start">
                        <Command>
                            <CommandInput placeholder="Change status..." onValueChange={setSearchQuery} />
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