import { create } from 'zustand'

export const useGraphStore = create((set) => ({
    hoveredNode: null,
    highlightedPath: new Set(),
    searchQuery: '',
    selectedNodes: new Set(),
    focusedNode: null,
    highlightOnHover: false,
    nodeMap: {},
}));


export const setHoveredNode = (node: any) => useGraphStore.setState((state) => ({
    ...state,
    hoveredNode: node,
}));

export const setHighlightedPath = (pathSet: any) => useGraphStore.setState((state) => ({
    ...state,
    highlightedPath: pathSet,
}));

export const setSearchQuery = (query: any) => useGraphStore.setState((state) => ({
    ...state,
    searchQuery: query,
}));

export const setSelectedNodes = (nodes: any) => useGraphStore.setState((state) => ({
    ...state,
    selectedNodes: nodes,
}));

export const setHighlightOnHover = (value: any) => useGraphStore.setState((state) => ({
    ...state,
    highlightOnHover: value,
}));

export const setNodeMap = (nodeMap: any) => useGraphStore.setState((state) => ({
    ...state,
    nodeMap,
}));

export const setFocusedNode = (focusedNode: any) => useGraphStore.setState((state) => ({
    ...state,
    focusedNode,
}));
