import yaml from 'js-yaml';

import testYaml from './sam'

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
  },
  path = 'root'
}) => {

  const node = {
    id: path,
    width: 100,
    height: 30,
    labels: [{ text: path.split('.').pop() }]
  };
  elkGraph.children.push(node);

  if (parentId) {
    elkGraph.edges.push({
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

export const getAncestors = (graph, nodes) => {
  const path = new Set();
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
  console.log('getAncestors', { path, nodes });
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

  let scale = Math.max(rangeX, rangeY);

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
export const computeCameraRatio = (graph, viewWidth = 1, viewHeight = 1) => {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  graph.forEachNode((_, attr) => {
    minX = Math.min(minX, attr.x);
    maxX = Math.max(maxX, attr.x);
    minY = Math.min(minY, attr.y);
    maxY = Math.max(maxY, attr.y);
  });

  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;

  // To fit the graph into view, choose the larger ratio
  const ratioX = graphWidth / viewWidth;
  const ratioY = graphHeight / viewHeight;

  const safeRatio = Math.max(ratioX, ratioY) * 1; // add padding

  console.log('ratioX', { ratioX, ratioY, safeRatio, graphWidth, graphHeight })

  return 0.75;
}

export const scaleLayoutForSigma = (elkLayoutResult, scaleFactor = 0.001) => {
  // Find the bounds of the ELK layout
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  elkLayoutResult.children.forEach(node => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });
  
  // Scale the layout to fit Sigma's expectations
  elkLayoutResult.children.forEach(node => {
    // Scale down the positions
    const scaledX = node.x * scaleFactor;
    const scaledY = node.y * scaleFactor;
    
    // Update the node with scaled coordinates
    node.x = scaledX;
    node.y = scaledY;
  });
  
  return elkLayoutResult;
}

