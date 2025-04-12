import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { setFocusedNode, useGraphStore } from "./state";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { FlexCol, FlexRow } from "@/layout/styled";

const Info = ({ getNodeInfo }) => {
    const { hoveredNode, selectedNodes, focusedNode } = useGraphStore();

    const nodeList = useMemo(() => {
        return Array.from(selectedNodes);
    }, [selectedNodes]);

    const nodeValue = useMemo(() => {
        if (focusedNode) {
            const nodeAttr = getNodeInfo(focusedNode);
            return nodeAttr.value || null;
        }
        return null;
    }, [focusedNode]);

    return (
        <Card style={{ height: '100%', minHeight: 250 }}>
            <CardHeader>
                <CardTitle>Info</CardTitle>
            </CardHeader>
            <CardContent>
                {hoveredNode && <div>Hovered: <Badge variant="outline">{hoveredNode}</Badge> </div>}
                <div> Selected: </div>
                <FlexRow>
                    {nodeList.map(node => {
                        return (
                            <Badge
                                key={node}
                                variant="outline"
                                onClick={() => setFocusedNode(node)}
                                style={{
                                    cursor: 'pointer',
                                    border: `1px solid ${focusedNode === node ? '#8BC34A' : 'hsl(var(--border))'} `,
                                }}
                            >
                                {node}
                            </Badge>
                        )
                    })}
                </FlexRow>
            </CardContent>
            <CardFooter>
                {nodeValue && (
                    <CardTitle>Value: {nodeValue}</CardTitle>
                )}
            </CardFooter>
        </Card>
    )
}

export default Info;