import yaml from 'js-yaml';
import type { ElkNode } from 'elkjs';
import type { DirectedGraph } from 'graphology';

/**
 * ELK node as produced by `yamlToElkGraph`. Extends elkjs' `ElkNode` with the
 * leaf `value` we attach while walking the YAML, which is not part of the
 * upstream type.
 */
export type GraphNode = ElkNode & { value?: unknown };

// Sample YAML string (you can load a file here)
const rawYaml = `
server:
  db:
    host: localhost
    port: 5432
  api:
    endpoint: /v1
    timeout: 30
    host: nothing
    more:
        host: something
        port: 4141
`;


// Parse YAML
export const parseYaml = (inputFile = rawYaml) => {
  return yaml.load(inputFile);
}


// Convert YAML to a tree structure
export const yamlToElkGraph = ({
  data,
  parentId = null,
  elkGraph = {
    id: 'root',
    layoutOptions: {
      "elk.algorithm": "layered", // or "mrtree" or "force"
      "elk.direction": "RIGHT",   // or "DOWN" if it fits better
      "elk.spacing.nodeNode": "50",
      "elk.spacing.edgeNode": "30",
      "elk.layered.spacing.nodeNodeBetweenLayers": "150",
      "elk.layered.spacing.edgeNodeBetweenLayers": "75",
      "elk.layered.considerModelOrder.strategy": "NODES",
      "elk.layered.nodePlacement.strategy": "SIMPLE", // also try "NETWORK_SIMPLEX"
      "elk.portConstraints": "FIXED_SIDE",

      'elk.hierarchical.components.removeOverlaps': 'true',
      'elk.separateConnectedComponents': 'true',
      'elk.partitioning.activate': 'true',        // Partition large graphs
      'elk.layered.compaction.connectedComponents': 'true',
      'elk.layered.highDegreeNodes.treatment': 'true',
      'elk.layered.highDegreeNodes.threshold': '16',
      'elk.stress.desiredEdgeLength': '160',      // For stress-based layouts
    },
    children: [],
    edges: []
  } as GraphNode,
  path = 'root'
}: {
  data: unknown;
  parentId?: string | null;
  elkGraph?: GraphNode;
  path?: string;
}): GraphNode => {

  const node: GraphNode = {
    id: path,
    width: 100,
    height: 30,
    labels: [{ text: path.split('.').pop() }],
  };
  (elkGraph.children ??= []).push(node);

  if (parentId) {
    (elkGraph.edges ??= []).push({
      id: `${parentId}->${path}`,
      sources: [parentId],
      targets: [path]
    });
  }

  if (typeof data === 'object' && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      yamlToElkGraph({ data: value, parentId: path, elkGraph, path: `${path}.${key}` });
    }
  } else {
    node.value = data;
  }

  return elkGraph;
}

export const getAncestors = (graph: DirectedGraph, nodes: Set<string>): Set<string> => {
  const path = new Set<string>();
  nodes.forEach((nodeId) => {
    let current = nodeId;

    while (true) {
      const preds = graph.inNeighbors(current);
      if (!preds.length) break;
      current = preds[0];
      path.add(current);
    }
    path.add(nodeId);
  });
  return path;
}

export const normalizeElkGraphCoordinates = (graph, elkGraph) => {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  // Calculate bounding box
  for (const node of elkGraph.children) {
    const { x, y, width = 0, height = 0 } = node;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + width);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + height);
  }

  const rangeX = maxX - minX;
  const rangeY = maxY - minY;

  const scale = Math.max(rangeX, rangeY);

  let offsetX = 0;
  let offsetY = 0;

  if (rangeX !== rangeY) {
    offsetX = (scale - rangeX) / 2;
    offsetY = (scale - rangeY) / 2;
  }

  // Normalize all node positions
  for (const node of elkGraph.children) {
    const { x, y } = node;

    const normX = (x - minX + offsetX) / scale;
    const normY = 1 - (y - minY + offsetY) / scale; // Flip Y for Sigma

    if (graph.hasNode(node.id)) {
      graph.setNodeAttribute(node.id, "normX", +normX.toFixed(4));
      graph.setNodeAttribute(node.id, "normY", +normY.toFixed(4));
    }
  }
}

// did not work :/
