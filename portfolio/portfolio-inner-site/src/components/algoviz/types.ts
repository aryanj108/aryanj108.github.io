// Shared vocabulary between the algorithms (which are pure and synchronous)
// and the playback engine (which replays their output onto a canvas).

// ── sorting ────────────────────────────────────────────────────────────────

export type SortStep =
    | { t: 'compare'; i: number; j: number }
    | { t: 'swap'; i: number; j: number }
    | { t: 'overwrite'; i: number; v: number } // merge / radix / counting
    | { t: 'pivot'; i: number }
    | { t: 'range'; lo: number; hi: number } // active subarray
    | { t: 'sorted'; i: number };

export interface SortRun {
    steps: SortStep[];
    /** false when an algorithm hit its step budget (only Bogo can do this). */
    complete: boolean;
    note?: string;
}

export type SortKey =
    | 'bubble'
    | 'insertion'
    | 'selection'
    | 'shell'
    | 'merge'
    | 'quick'
    | 'heap'
    | 'radix'
    | 'counting'
    | 'bogo';

export interface SortMeta {
    key: SortKey;
    label: string;
    best: string;
    average: string;
    worst: string;
    space: string;
    stable: boolean;
    /** Bogo is only tractable on a handful of elements. */
    maxN?: number;
    note: string;
}

// ── pathfinding ────────────────────────────────────────────────────────────

export type PathStep =
    | { t: 'frontier'; idx: number } // pushed onto the open set
    | { t: 'visit'; idx: number } // popped / closed
    | { t: 'path'; idx: number } // member of the final traced route
    | { t: 'done'; found: boolean };

export interface PathRun {
    steps: PathStep[];
    found: boolean;
    /** Sum of terrain weights along the route, excluding the start cell. */
    cost: number;
    /** Number of cells in the route, including both endpoints. */
    length: number;
    visited: number;
}

export type PathKey = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'greedy' | 'bidir';

export interface PathMeta {
    key: PathKey;
    label: string;
    /** Does it always return a minimum-cost route? */
    optimal: boolean;
    /** Does it actually read terrain weights? */
    weighted: boolean;
    note: string;
}

/**
 * Flat grid. Index of (x, y) is y * w + x, which keeps every hot loop on a
 * typed array instead of an array of objects.
 */
export interface Grid {
    w: number;
    h: number;
    wall: Uint8Array;
    /** Movement cost to enter a cell: 1 normal, HEAVY for painted terrain. */
    weight: Uint8Array;
    start: number;
    goal: number;
}

export const HEAVY = 8;

// Cell render states, kept in a Uint8Array owned by the player.
export const CELL_NONE = 0;
export const CELL_FRONTIER = 1;
export const CELL_VISITED = 2;
export const CELL_PATH = 3;
