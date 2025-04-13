import { create } from 'zustand'


const resettableStateBits = {
    // select and focus
    selectedNodes: new Set(),
    highlightedPath: new Set(),
    focusedNode: null,

    // hover
    hoveredNode: null,
    hoverPath: new Set(),

    // search, TODO: localize
    searchQuery: '',

    // toggles
    highlightOnHover: false,
    hideBackgroundNodes: false,
    fullscreen: false,
}

export const useGraphStore = create((set) => ({
    ...resettableStateBits,
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

export const setHideBackgroundNodes = (hideBackgroundNodes: any) => useGraphStore.setState((state) => ({
    ...state,
    hideBackgroundNodes,
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

export const setHoverPath = (hoverPath: any) => useGraphStore.setState((state) => ({
    ...state,
    hoverPath,
}));

export const clearState = () => useGraphStore.setState((state) => ({
    ...state,
    ...resettableStateBits,
}));

export const setFullscreen = (fullscreen: any) => useGraphStore.setState((state) => ({
  ...state,
  fullscreen,
}));
