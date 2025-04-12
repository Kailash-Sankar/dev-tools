import { create } from 'zustand'

export const useGraphStore = create((set) => ({
    hoveredNode: null,
    highlightedPath: new Set(),
    searchQuery: '',
    selectedNode: null,
    highlightOnHover: true,
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

export const setSelectedNode = (node: any) => useGraphStore.setState((state) => ({
    ...state,
    selectedNode: node,
}));

export const setHighlightOnHover = (value: any) => useGraphStore.setState((state) => ({
    ...state,
    highlightOnHover: value,
}));
