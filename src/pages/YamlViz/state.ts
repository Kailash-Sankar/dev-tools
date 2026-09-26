import { create } from 'zustand'

/** Node info as produced by sigma/graphology for a focused node. */
export type NodeInfo = Record<string, unknown> | null;

/** Maps a node label to the list of graph node ids carrying that label. */
export type NodeMap = Record<string, string[]>;

export interface GraphState {
    // select and focus
    selectedNodes: Set<string>;
    highlightedPath: Set<string>;
    focusedNode: NodeInfo;

    // hover
    hoveredNode: NodeInfo;
    hoverPath: Set<string>;

    // search, TODO: localize
    searchQuery: string;

    // toggles
    highlightOnHover: boolean;
    hideBackgroundNodes: boolean;
    fullscreen: boolean;

    nodeMap: NodeMap;
}

const resettableStateBits = {
    // select and focus
    selectedNodes: new Set<string>(),
    highlightedPath: new Set<string>(),
    focusedNode: null as NodeInfo,

    // hover
    hoveredNode: null as NodeInfo,
    hoverPath: new Set<string>(),

    // search, TODO: localize
    searchQuery: '',

    // toggles
    highlightOnHover: false,
    hideBackgroundNodes: false,
    fullscreen: false,
}

export const useGraphStore = create<GraphState>(() => ({
    ...resettableStateBits,
    nodeMap: {},
}));


export const setHoveredNode = (node: NodeInfo) => useGraphStore.setState((state) => ({
    ...state,
    hoveredNode: node,
}));

export const setHighlightedPath = (pathSet: Set<string>) => useGraphStore.setState((state) => ({
    ...state,
    highlightedPath: pathSet,
}));

export const setHideBackgroundNodes = (hideBackgroundNodes: boolean) => useGraphStore.setState((state) => ({
    ...state,
    hideBackgroundNodes,
}));

export const setSearchQuery = (query: string) => useGraphStore.setState((state) => ({
    ...state,
    searchQuery: query,
}));

export const setSelectedNodes = (nodes: Set<string>) => useGraphStore.setState((state) => ({
    ...state,
    selectedNodes: nodes,
}));

export const setHighlightOnHover = (value: boolean) => useGraphStore.setState((state) => ({
    ...state,
    highlightOnHover: value,
}));

export const setNodeMap = (nodeMap: NodeMap) => useGraphStore.setState((state) => ({
    ...state,
    nodeMap,
}));

export const setFocusedNode = (focusedNode: NodeInfo) => useGraphStore.setState((state) => ({
    ...state,
    focusedNode,
}));

export const setHoverPath = (hoverPath: Set<string>) => useGraphStore.setState((state) => ({
    ...state,
    hoverPath,
}));

export const clearState = () => useGraphStore.setState((state) => ({
    ...state,
    ...resettableStateBits,
}));

export const setFullscreen = (fullscreen: boolean) => useGraphStore.setState((state) => ({
  ...state,
  fullscreen,
}));
