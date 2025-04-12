import Graph, { DirectedGraph } from 'graphology';
import Sigma from 'sigma';
import ELK from "elkjs/lib/elk.bundled.js";
import { computeCameraRatio, getAncestors, layoutDAG, normalizeElkGraphCoordinates, scaleLayoutForSigma, yamlToElkGraph } from './utils';
import { useCallback, useEffect, useRef } from 'react';
import { setFocusedNode, setHighlightedPath, setHoveredNode, setNodeMap, setSelectedNodes, useGraphStore } from './state';

const useGraph = () => {
    const containerRef = useRef(null);
    const graphRef: any = useRef(null);
    const rendererRef: any = useRef(null);

    const { selectedNodes, focusedNode } = useGraphStore();


    const handleRender = ({ parsedYaml }) => {
        console.log('parsedYaml', parsedYaml);

        // cleanup previous instance
        if(rendererRef.current) {
            rendererRef.current.kill();
        }

        if(graphRef.current) {
            graphRef.current.clear();
        }

        const elk = new ELK();

        const elkInput = yamlToElkGraph({ data: parsedYaml });


        console.log('elkInput', elkInput);

        const nodeMap: any = {};

        // Build ELK graph
        elk.layout(elkInput).then((elkOutput: any) => {
            const graph = new DirectedGraph();
            graphRef.current = graph;

            // Add nodes with layout positions
            elkOutput.children.forEach((node: any) => {
                const label = node.labels[0].text;

                graph.addNode(node.id, {
                    label: node.labels[0].text,
                    x: node.x,
                    y: node.y,
                    size: 6,
                    color: '#0074D9',
                    value: node.value,
                    // type: 'circle',
                });

                if (label in nodeMap) {
                    nodeMap[label].push(node.id);
                } else {
                    nodeMap[label] = [node.id]
                }
            });

            // this aligns x and y coords, otherwise camera breaks
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
                    const { selectedNodes, highlightedPath } = useGraphStore.getState();

                    const isHoveredPath = highlightedPath.has(node);
                    const isSelected = selectedNodes.has(node);

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
                if (!highlightOnHover) { return; }

                setHoveredNode(node);
                const ancestors = getAncestors(graph, new Set([node]));
                setHighlightedPath(ancestors);
                rendererRef.current.refresh();
            });

            rendererRef.current.on("leaveNode", () => {
                const { highlightOnHover } = useGraphStore.getState();
                if (!highlightOnHover) { return; }

                setHoveredNode(null);
                setHighlightedPath(new Set());
                rendererRef.current.refresh();
            });

            rendererRef.current.on("clickNode", ({ node }) => {
                console.log("Node clicked:", node);
                setSelectedNodes(new Set([node]));
            });

            rendererRef.current?.getCamera().animatedReset();
            setNodeMap(nodeMap);
            console.log('nodeMap', nodeMap);

            window.camera = rendererRef.current?.getCamera();
            window.sigma = rendererRef.current;

            rendererRef.current.setSetting('zoomMin', 0.1);
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
            setSelectedNodes(new Set([nodeId]));
        } else {
            alert("Node not found");
        }
    };

    const focusCameraOnNode = (nodeId) => {
        const graph = graphRef.current
        const camera = rendererRef.current?.getCamera();
        const { width, height } = rendererRef.current.getDimensions();
        const computedRatio = computeCameraRatio(graph, width, height);

        const nodeAttr = graph.getNodeAttributes(nodeId);

        const nodeCount = graph.order;
        const ratio = Math.min(1, Math.max(0.1, 100 / nodeCount)); 

        console.log('ratio', { ratio,  width, height, nodeAttr, nodeCount, computedRatio });

        // Zoom in on the node
        camera?.animate(
            { x: nodeAttr.normX, y: nodeAttr.normY, ratio: 0.75 }, // target values
            { duration: 600 } // options
        );
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
        if(node) {
            return graphRef.current.getNodeAttributes(node);
        }
    }

    return { containerRef, handleRender, handleSearch, resetCamera, focusCameraOnNode, getNodeInfo };
}

export default useGraph;