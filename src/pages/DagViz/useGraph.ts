import { DirectedGraph } from 'graphology';
import Sigma from 'sigma';
import ELK from "elkjs/lib/elk.bundled.js";
import { getAncestors, normalizeElkGraphCoordinates, parseYaml, yamlToElkGraph } from './utils';
import { useRef } from 'react';
import { setHighlightedPath, setHoveredNode, setSelectedNode, useGraphStore } from './state';

const elk = new ELK();

const useGraph = () => {
    const containerRef = useRef(null);
    const graphRef: any = useRef(null);
    const rendererRef: any = useRef(null);


    const handleRender = () => {
        // format input
        const parsedYaml = parseYaml();
        console.log('parsedYaml', parsedYaml);

        const elkInput = yamlToElkGraph({ data: parsedYaml });
        console.log('elkInput', elkInput);

        // Build ELK graph
        elk.layout(elkInput).then((elkOutput: any) => {
            console.log('elkOutput', elkOutput);
            const graph = new DirectedGraph();
            graphRef.current = graph;


            // Add nodes with layout positions
            elkOutput.children.forEach((node: any) => {
                console.log('elk loop', node);
                graph.addNode(node.id, {
                    label: node.labels[0].text,
                    x: node.x,
                    y: node.y,
                    size: 6,
                    color: '#0074D9',
                    // type: 'circle',
                });
            });

            normalizeElkGraphCoordinates(graph, elkOutput);
            console.log('elkOutput::post', elkOutput);

            // Add edges
            elkOutput.edges.forEach((edge) => {
                graph.addEdge(edge.sources[0], edge.targets[0], { type: 'arrow' });
            });

            // Render
            rendererRef.current = new Sigma(graph, containerRef.current, {
                renderLabels: true,
                nodeReducer: (node, data) => {
                    const { selectedNode, highlightedPath } = useGraphStore.getState();

                    const isHoveredPath = highlightedPath.has(node);
                    const isSelected = selectedNode === node;

                    // console.log('nodeReducer', { highlightedPath, searchedNode, node, isHoveredPath, isSearched });

                    return {
                        ...data,
                        color: isSelected ? '#9C27B0' : isHoveredPath ? '#FF9800' : '#2196F3',
                        size: isSelected ? 10 : data.size || 5,
                        zIndex: isHoveredPath ? 1 : 0,
                    };
                },
                edgeReducer: (edge, data) => {
                    const { highlightedPath } = useGraphStore.getState();
                    if (!highlightedPath.size) return data;

                    const [source, target] = graph.extremities(edge);
                    const isHighlighted =
                        highlightedPath.has(source) && highlightedPath.has(target);

                    return {
                        ...data,
                        color: isHighlighted ? "#FF5722" : "#eee",
                        size: isHighlighted ? 2 : 0.5,
                    };
                },
            });

            // Event listeners
            rendererRef.current.on("enterNode", ({ node }) => {
                const { highlightOnHover } = useGraphStore.getState();
                if(!highlightOnHover) { return; }

                setHoveredNode(node);
                const ancestors = getAncestors(graph, node);
                setHighlightedPath(ancestors);
                rendererRef.current.refresh();
            });

            rendererRef.current.on("leaveNode", () => {
                const { highlightOnHover } = useGraphStore.getState();
                if(!highlightOnHover) { return; }

                setHoveredNode(null);
                setHighlightedPath(new Set());
                rendererRef.current.refresh();
            });

            rendererRef.current.on("clickNode", ({ node }) => {
                console.log("Node clicked:", node);
                setSelectedNode(node);
                const ancestors = getAncestors(graph, node);
                setHighlightedPath(ancestors);
                rendererRef.current.refresh();
            });

            rendererRef.current?.getCamera().animatedReset();
            window.camera = rendererRef.current?.getCamera();
            window.sigma = rendererRef.current;
        });
    }

    const handleSearch = () => {
        const { searchQuery } = useGraphStore.getState();
        if (!searchQuery) return;

        const graph = graphRef.current;

        const nodeId = graph.nodes().find((node) => {
            console.log('node', node);
            const label = graph.getNodeAttribute(node, 'label');
            return node === searchQuery || label === searchQuery;
        });

        if (nodeId) {
            setSelectedNode(nodeId);

            const ancestors = getAncestors(graph, nodeId);
            setHighlightedPath(ancestors);

            const nodeAttr = graph.getNodeAttributes(nodeId);
            const camera = rendererRef.current?.getCamera();

            console.log('handleSearch', { searchQuery, nodeId, info: nodeAttr, camera });

            // Zoom in on the node
            camera?.animate(
                { x: nodeAttr.x, y: nodeAttr.y, ratio: 1.2 }, // target values
                { duration: 600 } // options
            );

            // focusCameraOnNodes(rendererRef.current, graph, [nodeId]);

            rendererRef.current?.refresh();
        } else {
            alert("Node not found");
        }
    };

    const resetCamera = () => {
        const camera = rendererRef.current?.getCamera();
        camera.animate(
            {
                x: 0.5,
                y: 0.5,
                ratio: 1, // full zoomed-out normalized view
            },
            { duration: 600 }
        );
    };


    return { containerRef, handleRender, handleSearch, resetCamera };
}

export default useGraph;