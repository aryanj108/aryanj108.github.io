// Graph searches as pure step generators, mirroring sorting.ts.
//
// Each returns the order cells entered the frontier and the order they were
// closed, plus the traced route. Nothing here mutates React state, so the
// prototype's silent bug - calling `.add()` on a Set held in state, which never
// triggers a re-render - cannot recur.

import { Grid, PathKey, PathMeta, PathRun, PathStep } from './types';

/**
 * Binary min-heap over (key, value) pairs held in parallel arrays. Dijkstra and
 * A* on a 60x40 grid push thousands of entries; a linear scan for the minimum
 * would dominate the runtime and make the visualization stutter.
 */
class MinHeap {
    private keys: number[] = [];
    private vals: number[] = [];

    get size(): number {
        return this.vals.length;
    }

    push(key: number, val: number): void {
        this.keys.push(key);
        this.vals.push(val);
        let i = this.vals.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.keys[parent] <= this.keys[i]) break;
            this.swap(i, parent);
            i = parent;
        }
    }

    pop(): number {
        const top = this.vals[0];
        const lastKey = this.keys.pop() as number;
        const lastVal = this.vals.pop() as number;
        if (this.vals.length > 0) {
            this.keys[0] = lastKey;
            this.vals[0] = lastVal;
            let i = 0;
            for (;;) {
                const left = 2 * i + 1;
                const right = left + 1;
                let best = i;
                if (left < this.keys.length && this.keys[left] < this.keys[best]) best = left;
                if (right < this.keys.length && this.keys[right] < this.keys[best]) best = right;
                if (best === i) break;
                this.swap(i, best);
                i = best;
            }
        }
        return top;
    }

    private swap(a: number, b: number): void {
        const k = this.keys[a];
        this.keys[a] = this.keys[b];
        this.keys[b] = k;
        const v = this.vals[a];
        this.vals[a] = this.vals[b];
        this.vals[b] = v;
    }
}

/**
 * Writes the open neighbours of `cell` into `out` and returns how many there
 * are. Filling a caller-owned buffer rather than taking a callback keeps every
 * search loop closure-free, which matters both for speed and because a function
 * defined inside a loop that captures a mutating counter trips `no-loop-func`.
 */
function neighbours(g: Grid, cell: number, out: Int32Array): number {
    const x = cell % g.w;
    const y = (cell - x) / g.w;
    let k = 0;
    if (y > 0 && !g.wall[cell - g.w]) out[k++] = cell - g.w;
    if (x < g.w - 1 && !g.wall[cell + 1]) out[k++] = cell + 1;
    if (y < g.h - 1 && !g.wall[cell + g.w]) out[k++] = cell + g.w;
    if (x > 0 && !g.wall[cell - 1]) out[k++] = cell - 1;
    return k;
}

function manhattan(g: Grid, a: number, b: number): number {
    const ax = a % g.w;
    const ay = (a - ax) / g.w;
    const bx = b % g.w;
    const by = (b - bx) / g.w;
    return Math.abs(ax - bx) + Math.abs(ay - by);
}

/**
 * Walk `prev` back from the goal, emit the route start-to-goal, and total its
 * terrain cost. The start cell is free; you pay to *enter* a cell.
 */
function finish(g: Grid, steps: PathStep[], prev: Int32Array, visited: number): PathRun {
    if (prev[g.goal] < 0 && g.goal !== g.start) {
        steps.push({ t: 'done', found: false });
        return { steps, found: false, cost: 0, length: 0, visited };
    }

    const route: number[] = [];
    let cur = g.goal;
    for (;;) {
        route.push(cur);
        if (cur === g.start) break;
        cur = prev[cur];
        if (cur < 0) break;
    }
    route.reverse();

    let cost = 0;
    for (let i = 0; i < route.length; i++) {
        steps.push({ t: 'path', idx: route[i] });
        if (i > 0) cost += g.weight[route[i]];
    }
    steps.push({ t: 'done', found: true });
    return { steps, found: true, cost, length: route.length, visited };
}

// -- unweighted searches ----------------------------------------------------

function bfs(g: Grid): PathRun {
    const n = g.w * g.h;
    const prev = new Int32Array(n).fill(-1);
    const seen = new Uint8Array(n);
    const queue = new Int32Array(n);
    const nbuf = new Int32Array(4);
    const steps: PathStep[] = [];
    let head = 0;
    let tail = 0;
    let visited = 0;

    queue[tail++] = g.start;
    seen[g.start] = 1;
    steps.push({ t: 'frontier', idx: g.start });

    while (head < tail) {
        const cur = queue[head++];
        steps.push({ t: 'visit', idx: cur });
        visited++;
        if (cur === g.goal) break;
        const count = neighbours(g, cur, nbuf);
        for (let i = 0; i < count; i++) {
            const nb = nbuf[i];
            if (!seen[nb]) {
                seen[nb] = 1;
                prev[nb] = cur;
                queue[tail++] = nb;
                steps.push({ t: 'frontier', idx: nb });
            }
        }
    }
    return finish(g, steps, prev, visited);
}

function dfs(g: Grid): PathRun {
    const n = g.w * g.h;
    const prev = new Int32Array(n).fill(-1);
    const seen = new Uint8Array(n);
    const nbuf = new Int32Array(4);
    const steps: PathStep[] = [];
    const stack: number[] = [g.start];
    let visited = 0;

    steps.push({ t: 'frontier', idx: g.start });
    while (stack.length > 0) {
        const cur = stack.pop() as number;
        if (seen[cur]) continue;
        seen[cur] = 1;
        steps.push({ t: 'visit', idx: cur });
        visited++;
        if (cur === g.goal) break;

        const count = neighbours(g, cur, nbuf);
        for (let i = 0; i < count; i++) {
            const nb = nbuf[i];
            if (!seen[nb]) {
                // Overwriting prev is safe: the new parent was closed before
                // this node is popped, so the chain still terminates at start.
                prev[nb] = cur;
                stack.push(nb);
                steps.push({ t: 'frontier', idx: nb });
            }
        }
    }
    return finish(g, steps, prev, visited);
}

function bidirectional(g: Grid): PathRun {
    const n = g.w * g.h;
    const prevA = new Int32Array(n).fill(-1);
    const prevB = new Int32Array(n).fill(-1);
    const distA = new Int32Array(n).fill(-1);
    const distB = new Int32Array(n).fill(-1);
    const nbuf = new Int32Array(4);
    const steps: PathStep[] = [];
    let qa: number[] = [g.start];
    let qb: number[] = [g.goal];
    let visited = 0;
    let best = Infinity;
    let meet = -1;

    distA[g.start] = 0;
    distB[g.goal] = 0;
    steps.push({ t: 'frontier', idx: g.start });
    steps.push({ t: 'frontier', idx: g.goal });

    if (g.start === g.goal) {
        meet = g.start;
        best = 0;
    }

    // Expanding whole levels, and continuing until no unexplored pair can beat
    // the best meeting found, is what makes this optimal. Stopping at the first
    // node both sides have touched is the classic bug: it can return a route one
    // step longer than the true shortest one.
    while (qa.length > 0 && qb.length > 0) {
        if (best !== Infinity && distA[qa[0]] + distB[qb[0]] >= best) break;

        const expandA = qa.length <= qb.length;
        const frontier = expandA ? qa : qb;
        const distSelf = expandA ? distA : distB;
        const distOther = expandA ? distB : distA;
        const prevSelf = expandA ? prevA : prevB;
        const next: number[] = [];

        for (let f = 0; f < frontier.length; f++) {
            const cur = frontier[f];
            steps.push({ t: 'visit', idx: cur });
            visited++;
            const count = neighbours(g, cur, nbuf);
            for (let i = 0; i < count; i++) {
                const nb = nbuf[i];
                if (distSelf[nb] >= 0) continue;
                distSelf[nb] = distSelf[cur] + 1;
                prevSelf[nb] = cur;
                next.push(nb);
                steps.push({ t: 'frontier', idx: nb });
                if (distOther[nb] >= 0) {
                    const total = distSelf[nb] + distOther[nb];
                    if (total < best) {
                        best = total;
                        meet = nb;
                    }
                }
            }
        }
        if (expandA) qa = next;
        else qb = next;
    }

    if (meet < 0) {
        steps.push({ t: 'done', found: false });
        return { steps, found: false, cost: 0, length: 0, visited };
    }

    // Stitch the two half-chains into one `prev` rooted at start. The A side
    // already points backwards; the B side points towards the goal, so it is
    // reversed as it is copied across.
    const prev = new Int32Array(n).fill(-1);
    let cur = meet;
    while (cur !== g.start && prevA[cur] >= 0) {
        prev[cur] = prevA[cur];
        cur = prevA[cur];
    }
    cur = meet;
    while (cur !== g.goal && prevB[cur] >= 0) {
        prev[prevB[cur]] = cur;
        cur = prevB[cur];
    }
    return finish(g, steps, prev, visited);
}

// -- weighted / informed searches -------------------------------------------

function dijkstra(g: Grid): PathRun {
    return bestFirst(g, 'dijkstra');
}

function astar(g: Grid): PathRun {
    return bestFirst(g, 'astar');
}

function greedy(g: Grid): PathRun {
    const n = g.w * g.h;
    const prev = new Int32Array(n).fill(-1);
    const seen = new Uint8Array(n);
    const nbuf = new Int32Array(4);
    const heap = new MinHeap();
    const steps: PathStep[] = [];
    let visited = 0;

    heap.push(manhattan(g, g.start, g.goal), g.start);
    seen[g.start] = 1;
    steps.push({ t: 'frontier', idx: g.start });

    while (heap.size > 0) {
        const cur = heap.pop();
        steps.push({ t: 'visit', idx: cur });
        visited++;
        if (cur === g.goal) break;
        const count = neighbours(g, cur, nbuf);
        for (let i = 0; i < count; i++) {
            const nb = nbuf[i];
            if (!seen[nb]) {
                seen[nb] = 1;
                prev[nb] = cur;
                heap.push(manhattan(g, nb, g.goal), nb);
                steps.push({ t: 'frontier', idx: nb });
            }
        }
    }
    return finish(g, steps, prev, visited);
}

/**
 * Dijkstra and A* differ only in whether the heap key includes the heuristic.
 * The Manhattan heuristic is admissible here because the cheapest possible move
 * costs 1, so it never overestimates and A* still returns a minimum-cost route.
 */
function bestFirst(g: Grid, mode: 'dijkstra' | 'astar'): PathRun {
    const n = g.w * g.h;
    const prev = new Int32Array(n).fill(-1);
    const dist = new Float64Array(n).fill(Infinity);
    const closed = new Uint8Array(n);
    const nbuf = new Int32Array(4);
    const heap = new MinHeap();
    const steps: PathStep[] = [];
    let visited = 0;

    dist[g.start] = 0;
    heap.push(mode === 'astar' ? manhattan(g, g.start, g.goal) : 0, g.start);
    steps.push({ t: 'frontier', idx: g.start });

    while (heap.size > 0) {
        const cur = heap.pop();
        if (closed[cur]) continue; // stale entry from a since-improved key
        closed[cur] = 1;
        steps.push({ t: 'visit', idx: cur });
        visited++;
        if (cur === g.goal) break;

        const count = neighbours(g, cur, nbuf);
        for (let i = 0; i < count; i++) {
            const nb = nbuf[i];
            if (closed[nb]) continue;
            const next = dist[cur] + g.weight[nb];
            if (next < dist[nb]) {
                dist[nb] = next;
                prev[nb] = cur;
                heap.push(mode === 'astar' ? next + manhattan(g, nb, g.goal) : next, nb);
                steps.push({ t: 'frontier', idx: nb });
            }
        }
    }
    return finish(g, steps, prev, visited);
}

// -- registry ---------------------------------------------------------------

const RUNNERS: { [K in PathKey]: (g: Grid) => PathRun } = {
    bfs,
    dfs,
    dijkstra,
    astar,
    greedy,
    bidir: bidirectional,
};

export const PATH_META: PathMeta[] = [
    {
        key: 'bfs',
        label: 'Breadth-First Search',
        optimal: true,
        weighted: false,
        note: 'Expands in rings of equal step count, so it finds the fewest-cells route. It ignores terrain cost entirely.',
    },
    {
        key: 'dfs',
        label: 'Depth-First Search',
        optimal: false,
        weighted: false,
        note: 'Dives down one branch until it dead-ends. Usually reaches the goal, almost never by a short route.',
    },
    {
        key: 'dijkstra',
        label: "Dijkstra's Algorithm",
        optimal: true,
        weighted: true,
        note: 'Always expands the cheapest known cell. Optimal for any non-negative weights, but it searches in every direction at once.',
    },
    {
        key: 'astar',
        label: 'A* (Manhattan)',
        optimal: true,
        weighted: true,
        note: 'Dijkstra plus an admissible distance estimate. Same optimal route, far fewer cells opened, because it aims at the goal.',
    },
    {
        key: 'greedy',
        label: 'Greedy Best-First',
        optimal: false,
        weighted: false,
        note: 'Follows the heuristic alone, ignoring the cost already paid. Very fast, and happily returns a badly suboptimal route.',
    },
    {
        key: 'bidir',
        label: 'Bidirectional BFS',
        optimal: true,
        weighted: false,
        note: 'Two breadth-first searches meeting in the middle. Two small circles beat one big one, so it opens far fewer cells than plain BFS.',
    },
];

export function pathMeta(key: PathKey): PathMeta {
    const found = PATH_META.filter((m) => m.key === key)[0];
    return found || PATH_META[0];
}

export function runPath(key: PathKey, g: Grid): PathRun {
    return RUNNERS[key](g);
}
