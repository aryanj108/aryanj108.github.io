// Grid construction and maze generation.
//
// The prototype scattered walls with `Math.random() < 0.3` and then tried to
// guarantee a route with a drunk walk from start to goal. That produced
// something that was neither a maze nor reliably solvable. These generators are
// connected by construction, and `ensureSolvable` is a hard backstop that runs
// on every grid before it reaches the player.

import { Grid, HEAVY } from './types';

export type MazeKind = 'backtracker' | 'prim' | 'division' | 'scatter' | 'empty';

export interface MazeMeta {
    key: MazeKind;
    label: string;
    note: string;
}

export const MAZE_META: MazeMeta[] = [
    {
        key: 'backtracker',
        label: 'Recursive Backtracker',
        note: 'Depth-first carving. Long winding corridors and few dead ends, which makes A* look dramatically better than BFS.',
    },
    {
        key: 'prim',
        label: "Randomized Prim's",
        note: 'Grows from a seed cell by picking a random frontier wall. Bushier than the backtracker, with many short dead ends.',
    },
    {
        key: 'division',
        label: 'Recursive Division',
        note: 'Starts empty and repeatedly bisects the open space with a walled line that has one gap. Produces long straight corridors.',
    },
    {
        key: 'scatter',
        label: 'Random Scatter',
        note: 'Independent random walls at a fixed density. Not a real maze, but the fastest way to see how each search fans out.',
    },
    {
        key: 'empty',
        label: 'Open Field',
        note: 'No walls at all. The clearest way to see the shape of each search: BFS expands a diamond, A* drives straight at the goal.',
    },
];

const idx = (w: number, x: number, y: number): number => y * w + x;

function randInt(n: number): number {
    return Math.floor(Math.random() * n);
}

/** Nudge a coordinate onto the odd lattice the carving generators use. */
function toOdd(v: number, max: number): number {
    let o = v % 2 === 1 ? v : v - 1;
    if (o < 1) o = 1;
    if (o > max) o = max % 2 === 1 ? max : max - 1;
    return o;
}

// -- generators -------------------------------------------------------------

function carveBacktracker(w: number, h: number): Uint8Array {
    const wall = new Uint8Array(w * h).fill(1);
    const stack: number[] = [];
    const sx = 1;
    const sy = 1;
    wall[idx(w, sx, sy)] = 0;
    stack.push(idx(w, sx, sy));

    const dx = [0, 2, 0, -2];
    const dy = [-2, 0, 2, 0];

    while (stack.length > 0) {
        const cur = stack[stack.length - 1];
        const cx = cur % w;
        const cy = (cur - cx) / w;

        const candX: number[] = [];
        const candY: number[] = [];
        for (let d = 0; d < 4; d++) {
            const nx = cx + dx[d];
            const ny = cy + dy[d];
            if (nx > 0 && ny > 0 && nx < w - 1 && ny < h - 1 && wall[idx(w, nx, ny)] === 1) {
                candX.push(nx);
                candY.push(ny);
            }
        }
        if (candX.length === 0) {
            stack.pop();
            continue;
        }
        const p = randInt(candX.length);
        const nx = candX[p];
        const ny = candY[p];
        wall[idx(w, (cx + nx) >> 1, (cy + ny) >> 1)] = 0; // knock out the shared wall
        wall[idx(w, nx, ny)] = 0;
        stack.push(idx(w, nx, ny));
    }
    return wall;
}

function carvePrim(w: number, h: number): Uint8Array {
    const wall = new Uint8Array(w * h).fill(1);
    // Frontier entries are (cell, wall-between) pairs held in parallel arrays.
    const fCell: number[] = [];
    const fWall: number[] = [];

    const dx = [0, 2, 0, -2];
    const dy = [-2, 0, 2, 0];

    const pushFrontier = (cx: number, cy: number): void => {
        for (let d = 0; d < 4; d++) {
            const nx = cx + dx[d];
            const ny = cy + dy[d];
            if (nx > 0 && ny > 0 && nx < w - 1 && ny < h - 1 && wall[idx(w, nx, ny)] === 1) {
                fCell.push(idx(w, nx, ny));
                fWall.push(idx(w, (cx + nx) >> 1, (cy + ny) >> 1));
            }
        }
    };

    wall[idx(w, 1, 1)] = 0;
    pushFrontier(1, 1);

    while (fCell.length > 0) {
        const p = randInt(fCell.length);
        const cell = fCell[p];
        const between = fWall[p];
        fCell[p] = fCell[fCell.length - 1];
        fWall[p] = fWall[fWall.length - 1];
        fCell.pop();
        fWall.pop();

        if (wall[cell] === 0) continue; // already absorbed
        wall[cell] = 0;
        wall[between] = 0;
        const cx = cell % w;
        pushFrontier(cx, (cell - cx) / w);
    }
    return wall;
}

function carveDivision(w: number, h: number): Uint8Array {
    const wall = new Uint8Array(w * h); // starts fully open
    for (let x = 0; x < w; x++) {
        wall[idx(w, x, 0)] = 1;
        wall[idx(w, x, h - 1)] = 1;
    }
    for (let y = 0; y < h; y++) {
        wall[idx(w, 0, y)] = 1;
        wall[idx(w, w - 1, y)] = 1;
    }

    // Iterative worklist rather than recursion: the grid can be large enough
    // that deep recursion is not worth the risk.
    const work: number[][] = [[1, 1, w - 2, h - 2]];
    while (work.length > 0) {
        const region = work.pop() as number[];
        const x0 = region[0];
        const y0 = region[1];
        const x1 = region[2];
        const y1 = region[3];
        const rw = x1 - x0 + 1;
        const rh = y1 - y0 + 1;
        // Pick only among orientations the region is actually big enough for;
        // choosing blind and bailing out leaves large uncarved rooms.
        const canSplitH = rh >= 5;
        const canSplitV = rw >= 5;
        if (!canSplitH && !canSplitV) continue;
        const horizontal =
            canSplitH && canSplitV
                ? rh > rw
                    ? true
                    : rw > rh
                    ? false
                    : randInt(2) === 0
                : canSplitH;

        if (horizontal) {
            let wy = y0 + 1 + randInt((rh - 2) >> 1) * 2;
            if (wy >= y1) wy = y1 - 1;
            const gap = x0 + randInt(rw);
            for (let x = x0; x <= x1; x++) if (x !== gap) wall[idx(w, x, wy)] = 1;
            work.push([x0, y0, x1, wy - 1]);
            work.push([x0, wy + 1, x1, y1]);
        } else {
            let wx = x0 + 1 + randInt((rw - 2) >> 1) * 2;
            if (wx >= x1) wx = x1 - 1;
            const gap = y0 + randInt(rh);
            for (let y = y0; y <= y1; y++) if (y !== gap) wall[idx(w, wx, y)] = 1;
            work.push([x0, y0, wx - 1, y1]);
            work.push([wx + 1, y0, x1, y1]);
        }
    }
    return wall;
}

function carveScatter(w: number, h: number, density: number): Uint8Array {
    const wall = new Uint8Array(w * h);
    for (let i = 0; i < wall.length; i++) {
        if (Math.random() < density) wall[i] = 1;
    }
    return wall;
}

// -- assembly ---------------------------------------------------------------

/**
 * Default endpoints for a grid of this size. Derived from the dimensions rather
 * than hardcoded, which is what stops the prototype's out-of-range crash when
 * the grid is made smaller than the endpoint coordinates.
 */
export function defaultEndpoints(w: number, h: number): { start: number; goal: number } {
    const sx = toOdd(1, w - 2);
    const sy = toOdd(h - 2, h - 2);
    const gx = toOdd(w - 2, w - 2);
    const gy = toOdd(1, h - 2);
    return { start: idx(w, sx, sy), goal: idx(w, gx, gy) };
}

/** Breadth-first reachability test. Weight-agnostic: it only asks "is there a route?". */
export function isReachable(g: Grid): boolean {
    const n = g.w * g.h;
    const seen = new Uint8Array(n);
    const queue = new Int32Array(n);
    let head = 0;
    let tail = 0;
    queue[tail++] = g.start;
    seen[g.start] = 1;

    while (head < tail) {
        const cur = queue[head++];
        if (cur === g.goal) return true;
        const x = cur % g.w;
        const y = (cur - x) / g.w;
        if (x > 0 && !g.wall[cur - 1] && !seen[cur - 1]) {
            seen[cur - 1] = 1;
            queue[tail++] = cur - 1;
        }
        if (x < g.w - 1 && !g.wall[cur + 1] && !seen[cur + 1]) {
            seen[cur + 1] = 1;
            queue[tail++] = cur + 1;
        }
        if (y > 0 && !g.wall[cur - g.w] && !seen[cur - g.w]) {
            seen[cur - g.w] = 1;
            queue[tail++] = cur - g.w;
        }
        if (y < g.h - 1 && !g.wall[cur + g.w] && !seen[cur + g.w]) {
            seen[cur + g.w] = 1;
            queue[tail++] = cur + g.w;
        }
    }
    return false;
}

/**
 * Carve an L-shaped corridor from start to goal. Only ever needed as a backstop
 * for Random Scatter, which has no connectivity guarantee of its own.
 */
function carveCorridor(g: Grid): void {
    const sx = g.start % g.w;
    const sy = (g.start - sx) / g.w;
    const gx = g.goal % g.w;
    const gy = (g.goal - gx) / g.w;

    const stepX = gx >= sx ? 1 : -1;
    for (let x = sx; x !== gx + stepX; x += stepX) g.wall[idx(g.w, x, sy)] = 0;
    const stepY = gy >= sy ? 1 : -1;
    for (let y = sy; y !== gy + stepY; y += stepY) g.wall[idx(g.w, gx, y)] = 0;
}

/** Guarantees the goal is reachable, carving a corridor if it somehow is not. */
export function ensureSolvable(g: Grid): Grid {
    g.wall[g.start] = 0;
    g.wall[g.goal] = 0;
    if (!isReachable(g)) carveCorridor(g);
    return g;
}

export interface GridOptions {
    w: number;
    h: number;
    kind: MazeKind;
    /** Wall density for Random Scatter, 0..1. */
    density: number;
    /** Fraction of open cells painted as heavy terrain, 0..1. */
    weightDensity: number;
    start?: number;
    goal?: number;
}

export function buildGrid(opts: GridOptions): Grid {
    const { w, h, kind, density, weightDensity } = opts;
    let wall: Uint8Array;
    switch (kind) {
        case 'backtracker':
            wall = carveBacktracker(w, h);
            break;
        case 'prim':
            wall = carvePrim(w, h);
            break;
        case 'division':
            wall = carveDivision(w, h);
            break;
        case 'scatter':
            wall = carveScatter(w, h, density);
            break;
        case 'empty':
        default:
            wall = new Uint8Array(w * h);
            break;
    }

    const ends = defaultEndpoints(w, h);
    const start = opts.start !== undefined ? opts.start : ends.start;
    const goal = opts.goal !== undefined ? opts.goal : ends.goal;

    const weight = new Uint8Array(w * h).fill(1);
    if (weightDensity > 0) {
        for (let i = 0; i < weight.length; i++) {
            if (wall[i] === 0 && i !== start && i !== goal && Math.random() < weightDensity) {
                weight[i] = HEAVY;
            }
        }
    }

    return ensureSolvable({ w, h, wall, weight, start, goal });
}

export function mazeMeta(key: MazeKind): MazeMeta {
    const found = MAZE_META.filter((m) => m.key === key)[0];
    return found || MAZE_META[0];
}
