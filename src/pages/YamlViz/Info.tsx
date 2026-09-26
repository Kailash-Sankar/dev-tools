import { useMemo } from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setFocusedNode, useGraphStore } from "./state";
import { cn } from "@/lib/utils";

type InfoProps = {
    getNodeInfo: (node: string) => Record<string, unknown> | null;
};

const Info = ({ getNodeInfo }: InfoProps) => {
    const { hoveredNode, selectedNodes, focusedNode } = useGraphStore();

    const nodeList = useMemo(() => Array.from(selectedNodes), [selectedNodes]);

    const nodeValue = useMemo(() => {
        if (!focusedNode) return null;
        try {
            const nodeAttr = getNodeInfo(focusedNode);
            const value = nodeAttr?.value;
            // Values can be arbitrarily large/cyclic, so don't try to render
            // an object -- show its type instead.
            if (value === null || value === undefined) return null;
            if (typeof value === "object") return Array.isArray(value) ? "array" : "object";
            return String(value);
        } catch {
            return null;
        }
    }, [focusedNode, getNodeInfo]);

    return (
        <Card className="flex min-w-0 flex-col overflow-hidden">
            <CardHeader className="shrink-0 py-3">
                <CardTitle className="text-sm">Info</CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 gap-2 overflow-auto">
                <div className="text-sm break-words">
                    Hovered:{" "}
                    {hoveredNode ? (
                        <Badge variant="outline" className="break-all">{String(hoveredNode)}</Badge>
                    ) : (
                        <span className="text-muted-foreground">none</span>
                    )}
                </div>

                <div className="text-sm">Selected:</div>
                <div className="flex flex-wrap gap-1.5">
                    {nodeList.length === 0 && (
                        <span className="text-muted-foreground text-sm">none</span>
                    )}
                    {nodeList.map((node) => (
                        <Badge
                            key={node}
                            variant="outline"
                            role="button"
                            tabIndex={0}
                            onClick={() => setFocusedNode(node)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") setFocusedNode(node);
                            }}
                            className={cn(
                                "cursor-pointer break-all",
                                focusedNode === node && "border-lime-500 text-lime-500"
                            )}
                        >
                            {node}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            {nodeValue && (
                <CardFooter className="shrink-0 py-3">
                    <CardTitle className="text-sm break-words [overflow-wrap:anywhere]">
                        Value: {nodeValue}
                    </CardTitle>
                </CardFooter>
            )}
        </Card>
    );
};

export default Info;
