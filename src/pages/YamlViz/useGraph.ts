import { DirectedGraph } from 'graphology';
// Value import (not `import type`) -- Sigma is instantiated at runtime below,
// and the class is also used as the ref's type.
import Sigma from 'sigma';
import type { ELKNode } from "elkjs";
import { layoutGraph } from './elk';
import { getAncestors, normalizeElkGraphCoordinates, yamlToElkGraph } from './utils';
import { useEffect, useRef } from 'react';
import { clearState, setFocusedNode, setHighlightedPath, setHoveredNode, setHoverPath, setNodeMap, setSelectedNodes, useGraphStore, type NodeMap } from './state';
import type { parseYaml } from './utils';

const useGraph = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<DirectedGraph | null>(null);
    const rendererRef = useRef<Sigma | null>(null);
    const renderToken = useRef(0);

    const { selectedNodes, focusedNode, hideBackgroundNodes, fullscreen } = useGraphStore();


    const handleRender = async ({ parsedYaml }: { parsedYaml: ReturnType<typeof parseYaml> }) => {
        // A render is async now that ELK lives in a worker. If the user hits
        // Render again before the first layout finishes, only the newest
        // result should be drawn -- otherwise a slow layout can land on top of
        // a newer one and render stale data.
        const token = ++renderToken.current;

        // cleanup previous instance
        if (rendererRef.current) {
            rendererRef.current.kill();
            rendererRef.current = null;
        }
        if (graphRef.current) {
            graphRef.current.clear();
            graphRef.current = null;
        }
        clearState();

        const elkInput = yamlToElkGraph({ data: parsedYaml });
        const nodeMap: NodeMap = {};

        // Yield to the event loop between batches so a large graph doesn't
        // add one long uninterrupted block of graph construction. (Measured:
        // graph building is not the bottleneck at these sizes -- Sigma's WebGL
        // rendering is -- but batching keeps it from compounding.)
        const yieldToUi = () => new Promise<void>((r) => setTimeout(r, 0));
        const BATCH = 500;

        try {
            // ELK layout runs in a Web Worker (see ./elk.ts).
            const elkOutput = await layoutGraph<{ children?: ELKNode[] }>(elkInput);

            if (token !== renderToken.current) return; // superseded

            const graph = new DirectedGraph();
            graphRef.current = graph;

            // Add nodes with layout positions, in batches.
            const children = elkOutput.children ?? [];
            for (let i = 0; i < children.length; i++) {
                const node = children[i];
                const label = node.labels?.[0]?.text ?? node.id;

                graph.addNode(node.id, {
                    label,
                    x: node.x,
                    y: node.y,
                    size: 6,
                    color: '#0074D9',
                    value: node.value,
                });

                if (label in nodeMap) {
                    nodeMap[label].push(node.id);
                } else {
                    nodeMap[label] = [node.id];
                }

                if ((i + 1) % BATCH === 0) await yieldToUi();
            }

            // this aligns x and y coords, otherwise camera breaks
            normalizeElkGraphCoordinates(graph, elkOutput);

            // Add edges, also in batches.
            const edges = elkOutput.edges ?? [];
            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];
                graph.addEdge(edge.sources[0], edge.targets[0], { type: 'arrow' });
                if ((i + 1) % BATCH === 0) await yieldToUi();
            }

            if (token !== renderToken.current) return; // superseded

            // Render
            const renderer = new Sigma(graph, containerRef.current, {
                renderLabels: true,
                nodeReducer: (node, data) => {
                    const { selectedNodes, highlightedPath, hideBackgroundNodes, hoverPath } = useGraphStore.getState();

                    const isHighlightedPath = highlightedPath.has(node) || hoverPath.has(node);
                    const isSelected = selectedNodes.has(node);

                    // console.log('nodeReducer', { highlightedPath, searchedNode, node, isHoveredPath, isSearched });

                    return {
                        ...data,
                        color: isSelected ? '#9C27B0' : isHighlightedPath ? '#FF9800' : '#2196F3',
                        size: isSelected ? 10 : data.size || 5,
                        zIndex: isHighlightedPath ? 1 : 0,
                        hidden: hideBackgroundNodes && !isHighlightedPath,
                    };
                },
                edgeReducer: (edge, data) => {
                    const { highlightedPath, hoverPath } = useGraphStore.getState();

                    const [source, target] = graph.extremities(edge);
                    const isHighlighted = (highlightedPath.has(source) && highlightedPath.has(target)) || (
                        hoverPath.has(source) && hoverPath.has(target)
                    );

                    const graphHasHighlight = highlightedPath.size > 0 || hoverPath.size > 0;

                    const defaultSize = graphHasHighlight ? 0.5 : data.size;
                    const defaultColor = graphHasHighlight ? "#eee" : data.color;

                    return {
                        ...data,
                        color: isHighlighted ? "#FF5722" : defaultColor,
                        size: isHighlighted ? 2 : defaultSize,
                    };
                },
            });

            // Event listeners
            renderer.on("enterNode", ({ node }) => {
                const { highlightOnHover } = useGraphStore.getState();
                if (!highlightOnHover) { return; }

                setHoveredNode(node);
                const ancestors = getAncestors(graph, new Set([node]));
                setHoverPath(ancestors);
                renderer.refresh();
            });

            renderer.on("leaveNode", () => {
                const { highlightOnHover } = useGraphStore.getState();
                if (!highlightOnHover) { return; }

                setHoveredNode(null);
                setHoverPath(new Set());
                renderer.refresh();
            });

            renderer.on("clickNode", ({ node }) => {
                setSelectedNodes(new Set([node]));
            });

            rendererRef.current = renderer;

            renderer.getCamera().animatedReset();
            setNodeMap(nodeMap);

            renderer.setSetting('zoomMin', 0.1);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("YAML layout failed", err);
        }
    }

    const handleSearch = () => {
        const { searchQuery } = useGraphStore.getState();
        if (!searchQuery) return;

        const graph = graphRef.current;

        const nodeId = graph.nodes().find((node) => {
            const label = graph.getNodeAttribute(node, 'label');
            return node === searchQuery || label === searchQuery;
        });

        if (nodeId) {
            setSelectedNodes(new Set([nodeId]));
        } else {
            alert("Node not found");
        }
    };

    const focusCameraOnNode = (nodeId: string) => {
        const graph = graphRef.current
        const camera = rendererRef.current?.getCamera();
        const { width, height } = rendererRef.current.getDimensions();

        const nodeAttr = graph.getNodeAttributes(nodeId);

        const nodeCount = graph.order;
        const approxRatio = Math.min(1, Math.max(0.1, 100 / nodeCount));

        console.log('focusCameraOnNode', { approxRatio, width, height, nodeAttr, nodeCount });

        // Zoom in on the node
        camera?.animate(
            { x: nodeAttr.normX, y: nodeAttr.normY, ratio: 0.75 }, // target values
            { duration: 600 } // options
        );
    }

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
        setFocusedNode(null);
    };

    const getNodeInfo = (node) => {
        if (node) {
            return graphRef.current.getNodeAttributes(node);
        }
    }

    const forceRefresh = () => {
        if (rendererRef.current) {
            rendererRef.current.refresh();
            resetCamera();
        }
    }


    useEffect(() => {
        const graph = graphRef.current
        if (graph && selectedNodes.size) {
            const ancestors = getAncestors(graph, selectedNodes);
            setHighlightedPath(ancestors);
            setFocusedNode(Array.from(selectedNodes)[0]);
            rendererRef.current.refresh();
        }
    }, [selectedNodes]);


    useEffect(() => {
        if (focusedNode) {
            focusCameraOnNode(focusedNode);
        }
    }, [focusedNode]);

    // trigger refresh on state change
    useEffect(() => {
        forceRefresh();
    }, [hideBackgroundNodes, fullscreen]);


    return { containerRef, handleRender, handleSearch, resetCamera, focusCameraOnNode, getNodeInfo, forceRefresh };
}

export default useGraph;
