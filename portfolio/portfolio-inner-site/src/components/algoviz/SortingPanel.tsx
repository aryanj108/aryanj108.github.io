import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ensureAudio, playTone } from './audio';
import { runSort, SORT_META, sortMeta } from './sorting';
import AlgoVizTheme from './theme';
import { SortKey, SortRun } from './types';
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

export type Distribution = 'random' | 'nearly' | 'reversed' | 'fewUnique';

const DISTRIBUTIONS: OptionItem<Distribution>[] = [
    { value: 'random', label: 'Random' },
    { value: 'nearly', label: 'Nearly sorted' },
    { value: 'reversed', label: 'Reversed' },
    { value: 'fewUnique', label: 'Few unique' },
];

const ALGO_OPTIONS: OptionItem<SortKey>[] = SORT_META.map((m) => ({
    value: m.key,
    label: m.label,
}));

const EMPTY_RUN: SortRun = { steps: [], complete: true };

/** Maps the 1..100 slider onto steps-per-frame, logarithmically. */
function stepsPerFrame(speed: number): number {
    const lo = 0.15;
    const hi = 800;
    return lo * Math.pow(hi / lo, (speed - 1) / 99);
}

/**
 * Values are a permutation of 1..n rather than the prototype's random 10..110.
 * That keeps every bar height distinct, makes the sorted state a clean ramp,
 * and gives radix and counting sort a sensible key range.
 */
function buildValues(n: number, dist: Distribution): number[] {
    const a: number[] = [];
    for (let i = 0; i < n; i++) a.push(i + 1);

    if (dist === 'reversed') {
        a.reverse();
        return a;
    }
    if (dist === 'fewUnique') {
        const buckets = Math.max(2, Math.round(n / 8));
        for (let i = 0; i < n; i++) {
            a[i] = Math.max(1, Math.round(((i % buckets) + 1) * (n / buckets)));
        }
        shuffle(a);
        return a;
    }
    if (dist === 'nearly') {
        const swaps = Math.max(1, Math.round(n * 0.05));
        for (let s = 0; s < swaps; s++) {
            const i = Math.floor(Math.random() * n);
            const j = Math.min(n - 1, i + 1 + Math.floor(Math.random() * 3));
            const t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
        return a;
    }
    shuffle(a);
    return a;
}

function shuffle(a: number[]): void {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}

function rampColor(norm: number): string {
    const lo = AlgoVizTheme.barLo;
    const hi = AlgoVizTheme.barHi;
    const r = Math.round(lo[0] + (hi[0] - lo[0]) * norm);
    const g = Math.round(lo[1] + (hi[1] - lo[1]) * norm);
    const b = Math.round(lo[2] + (hi[2] - lo[2]) * norm);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

export interface SortingPanelProps {
    width: number;
    height: number;
    soundOn: boolean;
}

const SortingPanel: React.FC<SortingPanelProps> = ({ width, height, soundOn }) => {
    const [algo, setAlgo] = useState<SortKey>('quick');
    const [size, setSize] = useState(80);
    const [dist, setDist] = useState<Distribution>('random');
    const [speed, setSpeed] = useState(55);
    const [run, setRun] = useState<SortRun>(EMPTY_RUN);
    const [computeMs, setComputeMs] = useState(0);
    const [seed, setSeed] = useState(0); // bumped to force a fresh shuffle

    const meta = sortMeta(algo);
    const effectiveSize = meta.maxN ? Math.min(size, meta.maxN) : size;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<HTMLDivElement | null>(null);
    const [box, setBox] = useState({ w: 640, h: 300 });

    const soundRef = useRef(soundOn);
    soundRef.current = soundOn;
    const runRef = useRef<SortRun>(EMPTY_RUN);
    runRef.current = run;

    const view = useRef({
        base: [] as number[],
        a: [] as number[],
        maxVal: 1,
        sorted: new Uint8Array(0),
        cmpA: -1,
        cmpB: -1,
        pivot: -1,
        write: -1,
        lo: -1,
        hi: -1,
        comparisons: 0,
        swaps: 0,
        writes: 0,
        accesses: 0,
    });

    // -- rendering ----------------------------------------------------------

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const v = view.current;
        const n = v.a.length;
        const w = box.w;
        const h = box.h;

        ctx.fillStyle = AlgoVizTheme.panelBg;
        ctx.fillRect(0, 0, w, h);
        if (n === 0) return;

        // Dim underlay marking the subarray the algorithm is working on.
        if (v.lo >= 0 && v.hi >= v.lo) {
            const x0 = (v.lo / n) * w;
            const x1 = ((v.hi + 1) / n) * w;
            ctx.fillStyle = AlgoVizTheme.barRange;
            ctx.fillRect(x0, 0, x1 - x0, h);
        }

        const slot = w / n;
        const gap = slot > 5 ? 1 : 0;
        const barW = Math.max(1, slot - gap);
        const usable = h - 3;

        for (let i = 0; i < n; i++) {
            const norm = v.a[i] / v.maxVal;
            let color: string;
            if (i === v.cmpA || i === v.cmpB) color = AlgoVizTheme.barCompare;
            else if (i === v.pivot) color = AlgoVizTheme.barPivot;
            else if (i === v.write) color = AlgoVizTheme.barWrite;
            else if (v.sorted[i]) color = AlgoVizTheme.barSorted;
            else color = rampColor(norm);

            const barH = Math.max(1, norm * usable);
            ctx.fillStyle = color;
            ctx.fillRect(i * slot, h - barH, barW, barH);
        }
    }, [box.w, box.h]);

    // -- playback host ------------------------------------------------------

    const resetView = useCallback(() => {
        const v = view.current;
        v.a = v.base.slice();
        v.sorted = new Uint8Array(v.base.length);
        v.cmpA = -1;
        v.cmpB = -1;
        v.pivot = -1;
        v.write = -1;
        v.lo = -1;
        v.hi = -1;
        v.comparisons = 0;
        v.swaps = 0;
        v.writes = 0;
        v.accesses = 0;
    }, []);

    const applyStep = useCallback((i: number, silent?: boolean) => {
        const v = view.current;
        const step = runRef.current.steps[i];
        if (!step) return;

        switch (step.t) {
            case 'compare':
                v.cmpA = step.i;
                v.cmpB = step.j;
                v.write = -1;
                v.comparisons++;
                v.accesses += 2;
                break;
            case 'swap': {
                const tmp = v.a[step.i];
                v.a[step.i] = v.a[step.j];
                v.a[step.j] = tmp;
                v.cmpA = step.i;
                v.cmpB = step.j;
                v.write = -1;
                v.swaps++;
                v.writes += 2;
                v.accesses += 4;
                if (soundRef.current && !silent) playTone(v.a[step.i] / v.maxVal);
                break;
            }
            case 'overwrite':
                v.a[step.i] = step.v;
                v.write = step.i;
                v.cmpA = -1;
                v.cmpB = -1;
                v.writes++;
                v.accesses++;
                if (soundRef.current && !silent) playTone(step.v / v.maxVal);
                break;
            case 'pivot':
                v.pivot = step.i;
                break;
            case 'range':
                v.lo = step.lo;
                v.hi = step.hi;
                break;
            case 'sorted':
                v.sorted[step.i] = 1;
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
    // `draw` is recreated when the canvas box changes, so refresh the binding.
    useEffect(() => {
        if (hostRef.current) hostRef.current.draw = () => draw();
    }, [draw]);

    const player = usePlayback(hostRef, stepsPerFrame(speed));

    // -- data + run generation ---------------------------------------------

    useEffect(() => {
        const values = buildValues(effectiveSize, dist);
        let max = 1;
        for (let i = 0; i < values.length; i++) if (values[i] > max) max = values[i];

        view.current.base = values;
        view.current.maxVal = max;

        const t0 = performance.now();
        const result = runSort(algo, values);
        setComputeMs(performance.now() - t0);
        setRun(result);
        runRef.current = result;

        resetView();
        player.rebind();
        draw();
        // player.rebind and draw are stable enough for this regeneration effect;
        // re-running on their identity would loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [algo, effectiveSize, dist, seed]);

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

    // -- handlers -----------------------------------------------------------

    const onRun = useCallback(() => {
        ensureAudio();
        player.toggle();
    }, [player]);

    const v = view.current;
    const total = run.steps.length;
    const progress = total === 0 ? 0 : Math.round((player.index / total) * 100);
    const finished = total > 0 && player.index >= total;

    return (
        <Col style={{ flex: 1, minHeight: 0 }}>
            <CrtFrame style={{ flex: 1, minHeight: 90 }}>
                <div
                    ref={frameRef}
                    style={{ display: 'flex', flex: 1, position: 'relative', minWidth: 0 }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
                    />
                </div>
            </CrtFrame>

            <Row style={{ marginTop: 6, marginBottom: 6 }}>
                <PushButton onClick={onRun} primary width={70}>
                    {player.playing ? 'Pause' : finished ? 'Replay' : 'Run'}
                </PushButton>
                <PushButton onClick={player.stepOnce} disabled={finished}>
                    Step
                </PushButton>
                <PushButton onClick={player.reset}>Reset</PushButton>
                <PushButton onClick={() => setSeed((s) => s + 1)}>Shuffle</PushButton>
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
                <Group title="Algorithm" style={{ marginRight: 6, marginBottom: 6 }}>
                    <Select value={algo} options={ALGO_OPTIONS} onChange={setAlgo} />
                    <div style={{ display: 'flex', marginTop: 5 }}>
                        <Select value={dist} options={DISTRIBUTIONS} onChange={setDist} />
                    </div>
                </Group>

                <Group title="Playback" style={{ marginRight: 6, marginBottom: 6 }}>
                    <Row>
                        <span style={labelStyle}>Size</span>
                        <Slider
                            value={effectiveSize}
                            min={8}
                            max={meta.maxN || 300}
                            onChange={setSize}
                        />
                        <span style={valueStyle}>{effectiveSize}</span>
                    </Row>
                    <Row style={{ marginTop: 5 }}>
                        <span style={labelStyle}>Speed</span>
                        <Slider value={speed} min={1} max={100} onChange={setSpeed} />
                        <span style={valueStyle}>{speed}</span>
                    </Row>
                </Group>

                <Group title="This run" style={{ flex: 1, minWidth: 260, marginBottom: 6 }}>
                    <Row wrap>
                        <Stat label="Comparisons" value={formatInt(v.comparisons)} />
                        <Stat label="Swaps" value={formatInt(v.swaps)} />
                        <Stat label="Writes" value={formatInt(v.writes)} />
                        <Stat label="Array reads" value={formatInt(v.accesses)} />
                        <Stat label="Steps" value={formatInt(total)} />
                        <Stat label="Compute" value={computeMs.toFixed(1) + ' ms'} />
                    </Row>
                </Group>
            </Row>

            <Group title="Complexity" style={{ marginBottom: 6 }}>
                <Row wrap>
                    <Stat label="Best" value={meta.best} />
                    <Stat label="Average" value={meta.average} />
                    <Stat label="Worst" value={meta.worst} />
                    <Stat label="Space" value={meta.space} />
                    <Stat label="Stable" value={meta.stable ? 'Yes' : 'No'} />
                </Row>
                <p style={noteStyle}>{meta.note}</p>
                {meta.maxN && size > meta.maxN ? (
                    <p style={warnStyle}>
                        Size is capped at {meta.maxN} for this algorithm.
                    </p>
                ) : null}
                {finished && run.note ? <p style={warnStyle}>{run.note}</p> : null}
                {finished && !run.complete ? (
                    <p style={warnStyle}>Step budget exhausted before the array was sorted.</p>
                ) : null}
            </Group>

            <div style={{ display: 'flex' }}>
                <Caption>Legend</Caption>
            </div>
            <Row wrap>
                <Swatch color={rampColor(0.75)} label="Value (taller = larger)" />
                <Swatch color={AlgoVizTheme.barCompare} label="Being compared" />
                <Swatch color={AlgoVizTheme.barPivot} label="Pivot / current min" />
                <Swatch color={AlgoVizTheme.barWrite} label="Just written" />
                <Swatch color={AlgoVizTheme.barSorted} label="In final position" />
                <Swatch color={AlgoVizTheme.barRange} label="Active subarray" />
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
    minWidth: 26,
    color: '#000',
};

const noteStyle: React.CSSProperties = {
    fontFamily: 'MSSerif',
    fontSize: 11,
    lineHeight: 1.5,
    marginTop: 4,
    color: '#2b2b2b',
};

const warnStyle: React.CSSProperties = {
    fontFamily: 'MSSerif',
    fontSize: 11,
    lineHeight: 1.5,
    marginTop: 4,
    color: '#8a1a10',
};

export default SortingPanel;
