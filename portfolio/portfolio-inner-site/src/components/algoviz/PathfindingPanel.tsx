import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ensureAudio, playTone } from './audio';
import { buildGrid, MAZE_META, MazeKind, mazeMeta } from './mazes';
import { PATH_META, pathMeta, runPath } from './pathfinding';
import AlgoVizTheme from './theme';
import {
    CELL_FRONTIER,
    CELL_NONE,
    CELL_PATH,
    CELL_VISITED,
    Grid,
    HEAVY,
    PathKey,
    PathRun,
} from './types';
import {
    Caption,
    Col,
    CrtFrame,
    formatInt,
    Group,
    OptionItem,
    PushButton,
    Row,
    Select,
    Slider,
    Stat,
    Swatch,
} from './ui';
import { PlaybackHost, usePlayback } from './usePlayback';

type Brush = 'wall' | 'weight' | 'erase';

const ALGO_OPTIONS: OptionItem<PathKey>[] = PATH_META.map((m) => ({
    value: m.key,
    label: m.label,
}));

const MAZE_OPTIONS: OptionItem<MazeKind>[] = MAZE_META.map((m) => ({
    value: m.key,
    label: m.label,
}));

const BRUSH_OPTIONS: OptionItem<Brush>[] = [
    { value: 'wall', label: 'Draw walls' },
    { value: 'weight', label: 'Draw heavy terrain' },
    { value: 'erase', label: 'Erase' },
];

const EMPTY_RUN: PathRun = { steps: [], found: false, cost: 0, length: 0, visited: 0 };

function stepsPerFrame(speed: number): number {
    const lo = 0.15;
    const hi = 600;
    return lo * Math.pow(hi / lo, (speed - 1) / 99);
}

export interface PathfindingPanelProps {
    width: number;
    height: number;
    soundOn: boolean;
}

const PathfindingPanel: React.FC<PathfindingPanelProps> = ({ width, height, soundOn }) => {
    const [algo, setAlgo] = useState<PathKey>('astar');
    const [maze, setMaze] = useState<MazeKind>('backtracker');
    const [brush, setBrush] = useState<Brush>('wall');
    const [cell, setCell] = useState(16);
    const [density, setDensity] = useState(30);
    const [weightPct, setWeightPct] = useState(0);
    const [speed, setSpeed] = useState(58);
    const [run, setRun] = useState<PathRun>(EMPTY_RUN);
    const [computeMs, setComputeMs] = useState(0);
    const [mazeSeed, setMazeSeed] = useState(0);
    const [gridVersion, setGridVersion] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<HTMLDivElement | null>(null);
    const [box, setBox] = useState({ w: 640, h: 300 });

    const soundRef = useRef(soundOn);
    soundRef.current = soundOn;
    const runRef = useRef<PathRun>(EMPTY_RUN);
    runRef.current = run;

    const gridRef = useRef<Grid | null>(null);
    const stateRef = useRef<Uint8Array>(new Uint8Array(0));
    const statsRef = useRef({ visited: 0, opened: 0 });
    /** Endpoints survive grid rebuilds; they are clamped, never assumed in range. */
    const endsRef = useRef<{ sx: number; sy: number; gx: number; gy: number } | null>(null);

    const gridW = Math.max(5, Math.floor(box.w / cell));
    const gridH = Math.max(5, Math.floor(box.h / cell));

    /** `set` is 1 when the stroke is adding walls/terrain, 0 when clearing. */
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

                // Heavy terrain keeps a centre marker even once it is visited,
                // so you can see a route paying to cross it or steering around.
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
                    const y = Math.floor(step.idx / g.w);
                    playTone(1 - y / Math.max(1, g.h));
                }
                break;
            case 'path':
                st[step.idx] = CELL_PATH;
                if (soundRef.current && !silent) {
                    const y = Math.floor(step.idx / g.w);
                    playTone(1 - y / Math.max(1, g.h));
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

    const player = usePlayback(hostRef, stepsPerFrame(speed));

    // -- grid construction --------------------------------------------------

    useEffect(() => {
        const clamp = (v: number, hi: number): number => Math.min(Math.max(v, 1), Math.max(1, hi));
        const prev = endsRef.current;
        let startIdx: number | undefined;
        let goalIdx: number | undefined;
        if (prev) {
            const sx = clamp(prev.sx, gridW - 2);
            const sy = clamp(prev.sy, gridH - 2);
            const gx = clamp(prev.gx, gridW - 2);
            const gy = clamp(prev.gy, gridH - 2);
            startIdx = sy * gridW + sx;
            goalIdx = gy * gridW + gx;
        }

        const g = buildGrid({
            w: gridW,
            h: gridH,
            kind: maze,
            density: density / 100,
            weightDensity: weightPct / 100,
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
        setGridVersion((n) => n + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gridW, gridH, maze, density, weightPct, mazeSeed]);

    // -- run generation -----------------------------------------------------

    useEffect(() => {
        const g = gridRef.current;
        if (!g) return;
        const t0 = performance.now();
        const result = runPath(algo, g);
        setComputeMs(performance.now() - t0);
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
    }, [width, height]);

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

    const brushRef = useRef<Brush>(brush);
    brushRef.current = brush;

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
        // Recompute once per stroke rather than per cell.
        setGridVersion((n) => n + 1);
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
                    b === 'wall' ? (g.wall[idx] ? 0 : 1) : b === 'weight' ? (g.weight[idx] > 1 ? 0 : 1) : 0;
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

    // -- handlers -----------------------------------------------------------

    const onRun = useCallback(() => {
        ensureAudio();
        player.toggle();
    }, [player]);

    const meta = pathMeta(algo);
    const mzMeta = mazeMeta(maze);
    const total = run.steps.length;
    const progress = total === 0 ? 0 : Math.round((player.index / total) * 100);
    const finished = total > 0 && player.index >= total;
    const st = statsRef.current;

    return (
        <Col style={{ flex: 1, minHeight: 0 }}>
            <CrtFrame style={{ flex: 1, minHeight: 90 }}>
                <div
                    ref={frameRef}
                    style={{ display: 'flex', flex: 1, position: 'relative', minWidth: 0 }}
                >
                    <canvas
                        ref={canvasRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        style={{
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            cursor: 'crosshair',
                        }}
                    />
                </div>
            </CrtFrame>

            <Row style={{ marginTop: 6, marginBottom: 6 }}>
                <PushButton onClick={onRun} primary width={70}>
                    {player.playing ? 'Pause' : finished ? 'Replay' : 'Search'}
                </PushButton>
                <PushButton onClick={player.stepOnce} disabled={finished}>
                    Step
                </PushButton>
                <PushButton onClick={player.reset}>Reset</PushButton>
                <PushButton onClick={() => setMazeSeed((s) => s + 1)} width={74}>
                    New maze
                </PushButton>
                <input
                    type="range"
                    min={0}
                    max={Math.max(1, total)}
                    value={player.index}
                    onChange={(e) => player.seek(Number(e.target.value))}
                    style={{
                        flex: 1,
                        width: 'auto',
                        minWidth: 60,
                        marginLeft: 8,
                        padding: 0,
                        boxShadow: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                />
                <span
                    style={{
                        fontFamily: 'MSSerif',
                        fontSize: 11,
                        marginLeft: 8,
                        minWidth: 34,
                        textAlign: 'right',
                    }}
                >
                    {progress}%
                </span>
            </Row>

            <Row wrap style={{ alignItems: 'flex-start' }}>
                <Group title="Search" style={{ marginRight: 6, marginBottom: 6 }}>
                    <Select value={algo} options={ALGO_OPTIONS} onChange={setAlgo} />
                    <div style={{ display: 'flex', marginTop: 5 }}>
                        <Select value={maze} options={MAZE_OPTIONS} onChange={setMaze} />
                    </div>
                    <div style={{ display: 'flex', marginTop: 5 }}>
                        <Select value={brush} options={BRUSH_OPTIONS} onChange={setBrush} />
                    </div>
                </Group>

                <Group title="Grid" style={{ marginRight: 6, marginBottom: 6 }}>
                    <Row>
                        <span style={labelStyle}>Cell</span>
                        <Slider value={cell} min={8} max={32} onChange={setCell} />
                        <span style={valueStyle}>{cell}px</span>
                    </Row>
                    <Row style={{ marginTop: 5 }}>
                        <span style={labelStyle}>Walls</span>
                        <Slider
                            value={density}
                            min={5}
                            max={45}
                            onChange={setDensity}
                            disabled={maze !== 'scatter'}
                        />
                        <span style={valueStyle}>{density}%</span>
                    </Row>
                    <Row style={{ marginTop: 5 }}>
                        <span style={labelStyle}>Heavy</span>
                        <Slider value={weightPct} min={0} max={40} onChange={setWeightPct} />
                        <span style={valueStyle}>{weightPct}%</span>
                    </Row>
                    <Row style={{ marginTop: 5 }}>
                        <span style={labelStyle}>Speed</span>
                        <Slider value={speed} min={1} max={100} onChange={setSpeed} />
                        <span style={valueStyle}>{speed}</span>
                    </Row>
                </Group>

                <Group title="This run" style={{ flex: 1, minWidth: 260, marginBottom: 6 }}>
                    <Row wrap>
                        <Stat label="Cells closed" value={formatInt(st.visited)} />
                        <Stat label="Cells opened" value={formatInt(st.opened)} />
                        <Stat label="Route length" value={run.found ? formatInt(run.length) : '-'} />
                        <Stat label="Route cost" value={run.found ? formatInt(run.cost) : '-'} />
                        <Stat label="Grid" value={gridW + ' x ' + gridH} />
                        <Stat label="Compute" value={computeMs.toFixed(2) + ' ms'} />
                    </Row>
                    <Row wrap style={{ marginTop: 4 }}>
                        <Stat
                            label="Shortest route"
                            value={meta.optimal ? 'Guaranteed' : 'Not guaranteed'}
                            wide
                        />
                        <Stat
                            label="Reads terrain cost"
                            value={meta.weighted ? 'Yes' : 'No'}
                            wide
                        />
                        <Stat label="Goal" value={run.found ? 'Reached' : 'Unreachable'} />
                    </Row>
                </Group>
            </Row>

            <Group style={{ marginBottom: 6 }}>
                <p style={noteStyle}>{meta.note}</p>
                <p style={noteStyle}>
                    <b>{mzMeta.label}:</b> {mzMeta.note}
                </p>
                {weightPct === 0 && meta.weighted ? (
                    <p style={hintStyle}>
                        With no heavy terrain, Dijkstra and A* can only tie BFS on route cost.
                        Raise Heavy above 0% to see them actually diverge.
                    </p>
                ) : null}
                <p style={hintStyle}>
                    Drag on the grid to draw, and drag the green or red square to move an
                    endpoint. The search re-runs when you release.
                </p>
            </Group>

            <div style={{ display: 'flex' }}>
                <Caption>Legend</Caption>
            </div>
            <Row wrap>
                <Swatch color={AlgoVizTheme.cellStart} label="Start" />
                <Swatch color={AlgoVizTheme.cellEnd} label="Goal" />
                <Swatch color={AlgoVizTheme.cellWall} label="Wall" />
                <Swatch color={AlgoVizTheme.cellWeight} label={'Heavy terrain (cost ' + HEAVY + ')'} />
                <Swatch color={AlgoVizTheme.cellFrontier} label="Frontier (open set)" />
                <Swatch color={AlgoVizTheme.cellVisited} label="Closed" />
                <Swatch color={AlgoVizTheme.cellPath} label="Final route" />
            </Row>
        </Col>
    );
};

const labelStyle: React.CSSProperties = {
    fontFamily: 'MSSerif',
    fontSize: 11,
    width: 40,
    color: '#000',
};

const valueStyle: React.CSSProperties = {
    fontFamily: 'MSSerif',
    fontSize: 11,
    marginLeft: 6,
    minWidth: 34,
    color: '#000',
};

const noteStyle: React.CSSProperties = {
    fontFamily: 'MSSerif',
    fontSize: 11,
    lineHeight: 1.5,
    marginTop: 3,
    color: '#2b2b2b',
};

const hintStyle: React.CSSProperties = {
    fontFamily: 'MSSerif',
    fontSize: 11,
    lineHeight: 1.5,
    marginTop: 4,
    color: '#3c4a5a',
};

export default PathfindingPanel;
