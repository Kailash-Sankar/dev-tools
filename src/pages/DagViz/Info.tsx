import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGraphStore } from "./state";
import { Badge } from "@/components/ui/badge";

const Info = () => {
    const { hoveredNode, selectedNode } = useGraphStore();

    console.log('useGraphStore',{ hoveredNode, selectedNode });

    return (
        <Card style={{ height: '100%', minHeight: 250 }}>
            <CardHeader>
                <CardTitle>Info</CardTitle>
            </CardHeader>
            <CardContent>
                {hoveredNode && <div>Hovered: <Badge variant="outline">{hoveredNode}</Badge> </div>}
                {selectedNode && <div>Selected: <Badge variant="outline">{selectedNode}</Badge> </div>}
            </CardContent>
            <CardFooter>
            </CardFooter>
        </Card>
    )
}

export default Info;