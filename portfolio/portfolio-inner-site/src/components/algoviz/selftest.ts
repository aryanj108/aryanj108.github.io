// Development-only correctness checks.
//
// There is no test runner wired into this project, and the algorithms are easy
// to break in ways that still look plausible on screen (an off-by-one in a
// merge, a heap that sorts but skips a step, an A* heuristic that stops being
// admissible). Replaying each step log and asserting the outcome catches all of
// that on first mount. Stripped from production builds.

import { buildGrid, isReachable, MAZE_META } from './mazes';
import { runPath } from './pathfinding';
import { runSort, SORT_META } from './sorting';
import { PathKey, SortKey, SortStep } from './types';

/** Fold a sort's step log back over the input, exactly as the player does. */
function replaySort(input: number[], steps: SortStep[]): number[] {
    const a = input.slice();
    for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        if (s.t === 'swap') {
            const t = a[s.i];
            a[s.i] = a[s.j];
            a[s.j] = t;
        } else if (s.t === 'overwrite') {
            a[s.i] = s.v;
        }
    }
    return a;
}

function isNonDecreasing(a: number[]): boolean {
    for (let i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false;
    return true;
}

function sameMultiset(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    const x = a.slice().sort((p, q) => p - q);
    const y = b.slice().sort((p, q) => p - q);
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
    return true;
}

function makeInput(n: number, kind: number): number[] {
    const a: number[] = [];
    for (let i = 0; i < n; i++) a.push(i + 1);
    if (kind === 1) return a.reverse();
    if (kind === 2) return a; // already sorted
    if (kind === 3) {
        for (let i = 0; i < n; i++) a[i] = (i % 5) + 1; // heavy duplicates
        return a;
    }
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
    return a;
}

export function runSelfTest(): void {
    const failures: string[] = [];

    // -- sorting: every step log must actually sort, and must not invent or
    //    lose elements along the way.
    for (let m = 0; m < SORT_META.length; m++) {
        const meta = SORT_META[m];
        const key = meta.key as SortKey;
        const n = meta.maxN ? Math.min(meta.maxN, 7) : 60;
        for (let kind = 0; kind < 4; kind++) {
            const input = makeInput(n, kind);
            const result = runSort(key, input);
            if (!result.complete) continue; // Bogo is allowed to give up
            const out = replaySort(input, result.steps);
            if (!isNonDecreasing(out)) failures.push(key + ' (input ' + kind + ') did not sort');
            if (!sameMultiset(out, input))
                failures.push(key + ' (input ' + kind + ') changed the multiset');
        }
    }

    // -- pathfinding: the optimal searches must agree on cost, and the
    //    heuristic-driven ones must at least reach the goal.
    const unweighted = buildGrid({
        w: 41,
        h: 21,
        kind: 'backtracker',
        density: 0.3,
        weightDensity: 0,
    });
    const optimalKeys: PathKey[] = ['bfs', 'dijkstra', 'astar', 'bidir'];
    let reference = -1;
    for (let i = 0; i < optimalKeys.length; i++) {
        const r = runPath(optimalKeys[i], unweighted);
        if (!r.found) {
            failures.push(optimalKeys[i] + ' failed to reach the goal on a carved maze');
            continue;
        }
        if (reference < 0) reference = r.cost;
        else if (r.cost !== reference)
            failures.push(
                optimalKeys[i] + ' cost ' + r.cost + ' disagrees with BFS cost ' + reference
            );
    }
    const anyKeys: PathKey[] = ['dfs', 'greedy'];
    for (let i = 0; i < anyKeys.length; i++) {
        if (!runPath(anyKeys[i], unweighted).found)
            failures.push(anyKeys[i] + ' failed to reach the goal on a carved maze');
    }

    // -- weighted: Dijkstra and A* must still agree, and must not be beaten by
    //    BFS, which does not read terrain cost at all.
    const weighted = buildGrid({
        w: 41,
        h: 21,
        kind: 'scatter',
        density: 0.18,
        weightDensity: 0.35,
    });
    const dij = runPath('dijkstra', weighted);
    const ast = runPath('astar', weighted);
    const bfs = runPath('bfs', weighted);
    if (dij.found !== ast.found) failures.push('Dijkstra and A* disagree on reachability');
    if (dij.found && ast.found && dij.cost !== ast.cost)
        failures.push('A* cost ' + ast.cost + ' differs from Dijkstra cost ' + dij.cost);
    if (dij.found && bfs.found && bfs.cost < dij.cost)
        failures.push('BFS found a cheaper route than Dijkstra, so Dijkstra is not optimal');

    // -- mazes: every generator must produce a solvable grid.
    for (let i = 0; i < MAZE_META.length; i++) {
        const kind = MAZE_META[i].key;
        for (let attempt = 0; attempt < 4; attempt++) {
            const g = buildGrid({
                w: 41,
                h: 21,
                kind,
                density: 0.35,
                weightDensity: 0.1,
            });
            if (!isReachable(g)) failures.push(kind + ' produced an unsolvable grid');
        }
    }

    if (failures.length > 0) {
        // eslint-disable-next-line no-console
        console.error('[AlgoViz] self-test FAILED:\n  ' + failures.join('\n  '));
    } else {
        // eslint-disable-next-line no-console
        console.log('[AlgoViz] self-test passed: sorts, searches and mazes all check out.');
    }
}
