import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { playTone } from './audio';
import { buildGrid, MazeKind } from './mazes';
import { pathMeta, runPath } from './pathfinding';
import {
    PATH_SPEED,
    SpeedKey,
    TERRAIN_DENSITY,
    TerrainKey,
} from './presets';
import AlgoVizTheme from './theme';
import {
    Brush,
    CELL_FRONTIER,
    CELL_NONE,
    CELL_PATH,
    CELL_VISITED,
    Grid,
    HEAVY,
    PanelControls,
    PanelStatus,
    PathKey,
    PathRun,
} from './types';
import { CrtFrame, formatInt } from './ui';
import { PlaybackHost, usePlayback } from './usePlayback';

const EMPTY_RUN: PathRun = { steps: [], found: false, cost: 0, length: 0, visited: 0 };

export interface PathfindingPanelProps {
    width: number;
    height: number;
    algo: PathKey;
    /** Grid dimensions in cells. */
    cols: number;
    rows: number;
    speed: SpeedKey;
    maze: MazeKind;
    terrain: TerrainKey;
    brush: Brush;
    sound: boolean;
    showTimeline: boolean;
    seed: number;
    onStatus: (s: PanelStatus) => void;
    onControls: (c: PanelControls) => void;
}

const PathfindingPanel: React.FC<PathfindingPanelProps> = ({
    width,
    height,
    algo,
    cols,
    rows,
    speed,
    maze,
    terrain,
    brush,
    sound,
    showTimeline,
    seed,
    onStatus,
    onControls,
}) => {
    const [run, setRun] = useState<PathRun>(EMPTY_RUN);
    const [box, setBox] = useState({ w: 640, h: 300 });
    const [gridVersion, setGridVersion] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<HTMLDivElement | null>(null);

    // The grid is a fixed number of cells; cell size is whatever makes that
    // fit the canvas, so the maze scales with the window instead of the count.
    const gridW = Math.max(5, cols);
    const gridH = Math.max(5, rows);
    const cell = Math.max(3, Math.floor(Math.min(box.w / gridW, box.h / gridH)));

    const soundRef = useRef(sound);
    soundRef.current = sound;
    const brushRef = useRef<Brush>(brush);
    brushRef.current = brush;
    const runRef = useRef<PathRun>(EMPTY_RUN);
    runRef.current = run;

    const gridRef = useRef<Grid | null>(null);
    const stateRef = useRef<Uint8Array>(new Uint8Array(0));
    const statsRef = useRef({ visited: 0, opened: 0 });
    /** Endpoints survive grid rebuilds; they are clamped, never assumed in range. */
    const endsRef = useRef<{ sx: number; sy: number; gx: number; gy: number } | null>(null);
    /** `set` is 1 when the stroke adds walls/terrain, 0 when it clears. */
    const drag = useRef<{ mode: 'paint' | 'start' | 'goal'; set: number } | null>(null);

    // -- rendering ----------------------------------------------------------

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const g = gridRef.current;
        if (!canvas || !g) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const st = stateRef.current;
        const offX = Math.floor((box.w - g.w * cell) / 2);
        const offY = Math.floor((box.h - g.h * cell) / 2);
        const inner = cell > 6 ? cell - 1 : cell;

        ctx.fillStyle = AlgoVizTheme.panelEdge;
        ctx.fillRect(0, 0, box.w, box.h);

        for (let y = 0; y < g.h; y++) {
            for (let x = 0; x < g.w; x++) {
                const i = y * g.w + x;
                const px = offX + x * cell;
                const py = offY + y * cell;

                let color: string;
                if (g.wall[i]) color = AlgoVizTheme.cellWall;
                else if (st[i] === CELL_PATH) color = AlgoVizTheme.cellPath;
                else if (st[i] === CELL_VISITED) color = AlgoVizTheme.cellVisited;
                else if (st[i] === CELL_FRONTIER) color = AlgoVizTheme.cellFrontier;
                else color = AlgoVizTheme.panelBg;

                ctx.fillStyle = color;
                ctx.fillRect(px, py, inner, inner);

                if (g.wall[i] && inner > 3) {
                    ctx.fillStyle = AlgoVizTheme.cellWallLit;
                    ctx.fillRect(px, py, inner, 1);
                    ctx.fillRect(px, py, 1, inner);
                }

                // Heavy terrain keeps a centre marker even once explored, so a
                // route paying to cross it stays visible.
                if (!g.wall[i] && g.weight[i] > 1 && inner > 5) {
                    const m = Math.max(2, Math.floor(inner / 2));
                    const o = Math.floor((inner - m) / 2);
                    ctx.fillStyle =
                        st[i] === CELL_NONE
                            ? AlgoVizTheme.cellWeight
                            : AlgoVizTheme.cellWeightLit;
                    ctx.fillRect(px + o, py + o, m, m);
                }
            }
        }

        const paintEnd = (idx: number, color: string): void => {
            const x = idx % g.w;
            const y = (idx - x) / g.w;
            ctx.fillStyle = color;
            ctx.fillRect(offX + x * cell, offY + y * cell, inner, inner);
        };
        paintEnd(g.start, AlgoVizTheme.cellStart);
        paintEnd(g.goal, AlgoVizTheme.cellEnd);
    }, [box.w, box.h, cell]);

    // -- playback host ------------------------------------------------------

    const resetView = useCallback(() => {
        const g = gridRef.current;
        if (!g) return;
        stateRef.current = new Uint8Array(g.w * g.h);
        statsRef.current.visited = 0;
        statsRef.current.opened = 0;
    }, []);

    const applyStep = useCallback((i: number, silent?: boolean) => {
        const g = gridRef.current;
        if (!g) return;
        const step = runRef.current.steps[i];
        if (!step) return;
        const st = stateRef.current;

        switch (step.t) {
            case 'frontier':
                if (st[step.idx] === CELL_NONE) {
                    st[step.idx] = CELL_FRONTIER;
                    statsRef.current.opened++;
                }
                break;
            case 'visit':
                st[step.idx] = CELL_VISITED;
                statsRef.current.visited++;
                if (soundRef.current && !silent) {
                    playTone(1 - Math.floor(step.idx / g.w) / Math.max(1, g.h));
                }
                break;
            case 'path':
                st[step.idx] = CELL_PATH;
                if (soundRef.current && !silent) {
                    playTone(1 - Math.floor(step.idx / g.w) / Math.max(1, g.h));
                }
                break;
            case 'done':
                break;
            // no default
        }
    }, []);

    const hostRef = useRef<PlaybackHost | null>(null);
    if (!hostRef.current) {
        hostRef.current = {
            total: () => runRef.current.steps.length,
            reset: resetView,
            apply: applyStep,
            draw: () => draw(),
        };
    }
    useEffect(() => {
        if (hostRef.current) hostRef.current.draw = () => draw();
    }, [draw]);

    const player = usePlayback(hostRef, PATH_SPEED[speed]);

    // -- grid construction --------------------------------------------------

    useEffect(() => {
        const clamp = (v: number, hi: number): number => Math.min(Math.max(v, 1), Math.max(1, hi));
        const prev = endsRef.current;
        let startIdx: number | undefined;
        let goalIdx: number | undefined;
        if (prev) {
            startIdx = clamp(prev.sy, gridH - 2) * gridW + clamp(prev.sx, gridW - 2);
            goalIdx = clamp(prev.gy, gridH - 2) * gridW + clamp(prev.gx, gridW - 2);
        }

        const g = buildGrid({
            w: gridW,
            h: gridH,
            kind: maze,
            density: 0.3,
            weightDensity: TERRAIN_DENSITY[terrain],
            start: startIdx,
            goal: goalIdx,
        });
        gridRef.current = g;
        endsRef.current = {
            sx: g.start % g.w,
            sy: Math.floor(g.start / g.w),
            gx: g.goal % g.w,
            gy: Math.floor(g.goal / g.w),
        };
        setGridVersion((v) => v + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gridW, gridH, maze, terrain, seed]);

    // -- run generation -----------------------------------------------------

    useEffect(() => {
        const g = gridRef.current;
        if (!g) return;
        const result = runPath(algo, g);
        setRun(result);
        runRef.current = result;
        resetView();
        player.rebind();
        draw();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [algo, gridVersion]);

    // -- canvas sizing ------------------------------------------------------

    useLayoutEffect(() => {
        const el = frameRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const w = Math.max(120, Math.floor(rect.width));
        const h = Math.max(80, Math.floor(rect.height));
        setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    }, [width, height, showTimeline]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(box.w * dpr);
        canvas.height = Math.round(box.h * dpr);
        canvas.style.width = box.w + 'px';
        canvas.style.height = box.h + 'px';
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.imageSmoothingEnabled = false;
        }
        draw();
    }, [box.w, box.h, draw]);

    // -- painting -----------------------------------------------------------

    const cellFromEvent = useCallback(
        (clientX: number, clientY: number): number => {
            const canvas = canvasRef.current;
            const g = gridRef.current;
            if (!canvas || !g) return -1;
            const rect = canvas.getBoundingClientRect();
            const offX = Math.floor((box.w - g.w * cell) / 2);
            const offY = Math.floor((box.h - g.h * cell) / 2);
            const x = Math.floor((clientX - rect.left - offX) / cell);
            const y = Math.floor((clientY - rect.top - offY) / cell);
            if (x < 0 || y < 0 || x >= g.w || y >= g.h) return -1;
            return y * g.w + x;
        },
        [box.w, box.h, cell]
    );

    /** Apply the in-progress stroke to one cell. */
    const strokeCell = useCallback((idx: number) => {
        const g = gridRef.current;
        const d = drag.current;
        if (!g || !d || idx < 0) return;

        if (d.mode === 'start' || d.mode === 'goal') {
            if (g.wall[idx]) return;
            if (d.mode === 'start' && idx !== g.goal) g.start = idx;
            if (d.mode === 'goal' && idx !== g.start) g.goal = idx;
            return;
        }

        if (idx === g.start || idx === g.goal) return;
        const x = idx % g.w;
        const y = (idx - x) / g.w;
        if (x === 0 || y === 0 || x === g.w - 1 || y === g.h - 1) return; // keep the border

        switch (brushRef.current) {
            case 'wall':
                g.wall[idx] = d.set;
                if (d.set) g.weight[idx] = 1;
                break;
            case 'weight':
                g.wall[idx] = 0;
                g.weight[idx] = d.set ? HEAVY : 1;
                break;
            case 'erase':
                g.wall[idx] = 0;
                g.weight[idx] = 1;
                break;
            // no default
        }
    }, []);

    const endStroke = useCallback(() => {
        if (!drag.current) return;
        drag.current = null;
        const g = gridRef.current;
        if (g) {
            endsRef.current = {
                sx: g.start % g.w,
                sy: Math.floor(g.start / g.w),
                gx: g.goal % g.w,
                gy: Math.floor(g.goal / g.w),
            };
        }
        setGridVersion((v) => v + 1); // recompute once per stroke, not per cell
    }, []);

    const onMouseDown = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const g = gridRef.current;
            if (!g) return;
            const idx = cellFromEvent(e.clientX, e.clientY);
            if (idx < 0) return;
            e.preventDefault();

            if (idx === g.start) drag.current = { mode: 'start', set: 0 };
            else if (idx === g.goal) drag.current = { mode: 'goal', set: 0 };
            else {
                // The first cell decides the whole stroke, so dragging back over
                // a wall you just drew does not flicker it off again.
                const b = brushRef.current;
                const set =
                    b === 'wall'
                        ? g.wall[idx]
                            ? 0
                            : 1
                        : b === 'weight'
                        ? g.weight[idx] > 1
                            ? 0
                            : 1
                        : 0;
                drag.current = { mode: 'paint', set };
            }
            strokeCell(idx);
            player.reset();
            draw();
        },
        [cellFromEvent, strokeCell, draw, player]
    );

    const onMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!drag.current) return;
            const idx = cellFromEvent(e.clientX, e.clientY);
            if (idx < 0) return;
            strokeCell(idx);
            draw();
        },
        [cellFromEvent, strokeCell, draw]
    );

    useEffect(() => {
        window.addEventListener('mouseup', endStroke);
        return () => window.removeEventListener('mouseup', endStroke);
    }, [endStroke]);

    // -- report upward ------------------------------------------------------

    useEffect(() => {
        onControls({ toggle: player.toggle, step: player.stepOnce, reset: player.reset });
    }, [onControls, player.toggle, player.stepOnce, player.reset]);

    const meta = pathMeta(algo);
    const total = run.steps.length;
    const progress = total === 0 ? 0 : Math.round((player.index / total) * 100);
    const finished = total > 0 && player.index >= total;
    const st = statsRef.current;
    // The route length only becomes meaningful once the replay reaches the end;
    // showing the final figure mid-run implies the search already found it.
    const counters =
        formatInt(st.visited) +
        ' explored · ' +
        (!finished
            ? formatInt(st.opened) + ' discovered'
            : run.found
            ? 'route ' + formatInt(run.length) + ', cost ' + formatInt(run.cost)
            : 'no route');

    useEffect(() => {
        onStatus({
            title: meta.label,
            subtitle: meta.optimal ? 'shortest route guaranteed' : 'not guaranteed shortest',
            tip: meta.note,
            counters,
            progress,
            playing: player.playing,
            finished,
        });
    }, [
        onStatus,
        meta.label,
        meta.optimal,
        meta.note,
        counters,
        progress,
        player.playing,
        finished,
    ]);

    return (
        <>
            <CrtFrame style={{ flex: 1, minHeight: 90 }}>
                <div ref={frameRef} style={styles.canvasHolder}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        style={styles.canvas}
                    />
                </div>
            </CrtFrame>
            {showTimeline ? (
                <input
                    type="range"
                    min={0}
                    max={Math.max(1, total)}
                    value={player.index}
                    onChange={(e) => player.seek(Number(e.target.value))}
                    style={styles.timeline}
                />
            ) : null}
        </>
    );
};

const styles: StyleSheetCSS = {
    canvasHolder: {
        display: 'flex',
        flex: 1,
        position: 'relative',
        minWidth: 0,
    },
    canvas: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: 'crosshair',
    },
    timeline: {
        width: 'auto',
        marginTop: 6,
        padding: 0,
        boxShadow: 'none',
        background: 'transparent',
        cursor: 'pointer',
        flexShrink: 0,
    },
};

export default PathfindingPanel;
