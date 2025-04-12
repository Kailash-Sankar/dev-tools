import yaml from 'js-yaml';

// Sample YAML string (you can load a file here)
const rawYaml = `
server:
  db:
    host: localhost
    port: 5432
  api:
    endpoint: /v1
    timeout: 30
`;


// Parse YAML 
export const parseYaml = () => {
    return yaml.load(rawYaml);
}

const defaultElkGraph = {
    id: 'root',
    layoutOptions: { algorithm: 'layered' },
    children: [],
    edges: []
  };
  

// Convert YAML to a tree structure
export const yamlToElkGraph = ({
    data,
    parentId = null,
    elkGraph = defaultElkGraph,
    path = 'root'
}) => {

    console.log('loop', { data, parentId, path });
    
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
            yamlToElkGraph({ data: value, parentId:path, elkGraph, path:`${path}.${key}`});
        }
    }

    return elkGraph;
}

export const getAncestors = (graph, nodeId) => {
    const path = new Set();
    let current = nodeId;

    while (true) {
      const preds = graph.inNeighbors(current);
      if (!preds.length) break;
      current = preds[0];
      path.add(current);
    }

    console.log('getAncestors', { path, nodeId });

    path.add(nodeId);
    return path;
  }

  export const normalizeElkGraphCoordinates = (graph, elkGraph) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
    elkGraph.children?.forEach((node) => {
      if (node.x == null || node.y == null) return;
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    });
  
    const width = maxX - minX;
    const height = maxY - minY;
  
    elkGraph.children?.forEach((node) => {
      if (node.x == null || node.y == null) return;

      const normX = (node.x - minX) / width;
      const normY = (node.y - minY) / height;

      const roundedX = parseFloat(normX.toFixed(2));
      const roundedY = parseFloat(normY.toFixed(2));
  
      graph.setNodeAttribute(node.id, "x", roundedX);
      graph.setNodeAttribute(node.id, "y", roundedY);   
    });
  }

