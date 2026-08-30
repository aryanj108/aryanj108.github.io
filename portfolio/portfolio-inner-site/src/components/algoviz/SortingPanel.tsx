import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { playTone } from './audio';
import { SORT_SIZE, SORT_SPEED, SizeKey, SpeedKey } from './presets';
import { runSort, sortMeta } from './sorting';
import AlgoVizTheme from './theme';
import {
    Distribution,
    PanelControls,
    PanelStatus,
    SortKey,
    SortRun,
} from './types';
import { CrtFrame, formatInt } from './ui';
import { PlaybackHost, usePlayback } from './usePlayback';

const EMPTY_RUN: SortRun = { steps: [], complete: true };

/**
 * Values are a permutation of 1..n rather than the prototype's random 10..110.
 * Every bar height stays distinct, a sorted array is a clean ramp, and radix
 * and counting sort get a sensible key range.
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
    algo: SortKey;
    size: SizeKey;
    speed: SpeedKey;
    order: Distribution;
    sound: boolean;
    showTimeline: boolean;
    seed: number;
    onStatus: (s: PanelStatus) => void;
    onControls: (c: PanelControls) => void;
}

const SortingPanel: React.FC<SortingPanelProps> = ({
    width,
    height,
    algo,
    size,
    speed,
    order,
    sound,
    showTimeline,
    seed,
    onStatus,
    onControls,
}) => {
    const [run, setRun] = useState<SortRun>(EMPTY_RUN);
    const [box, setBox] = useState({ w: 640, h: 300 });

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<HTMLDivElement | null>(null);

    const meta = sortMeta(algo);
    // Bogo is only tractable on a handful of elements, so it caps the preset.
    const n = meta.maxN ? Math.min(SORT_SIZE[size], meta.maxN) : SORT_SIZE[size];

    const soundRef = useRef(sound);
    soundRef.current = sound;
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
    });

    // -- rendering ----------------------------------------------------------

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const v = view.current;
        const count = v.a.length;
        const w = box.w;
        const h = box.h;

        ctx.fillStyle = AlgoVizTheme.panelBg;
        ctx.fillRect(0, 0, w, h);
        if (count === 0) return;

        if (v.lo >= 0 && v.hi >= v.lo) {
            const x0 = (v.lo / count) * w;
            const x1 = ((v.hi + 1) / count) * w;
            ctx.fillStyle = AlgoVizTheme.barRange;
            ctx.fillRect(x0, 0, x1 - x0, h);
        }

        const slot = w / count;
        const gap = slot > 5 ? 1 : 0;
        const barW = Math.max(1, slot - gap);
        const usable = h - 3;

        for (let i = 0; i < count; i++) {
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
                if (soundRef.current && !silent) playTone(v.a[step.i] / v.maxVal);
                break;
            }
            case 'overwrite':
                v.a[step.i] = step.v;
                v.write = step.i;
                v.cmpA = -1;
                v.cmpB = -1;
                v.writes++;
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
    useEffect(() => {
        if (hostRef.current) hostRef.current.draw = () => draw();
    }, [draw]);

    const player = usePlayback(hostRef, SORT_SPEED[speed]);

    // -- data + run generation ---------------------------------------------

    useEffect(() => {
        const values = buildValues(n, order);
        let max = 1;
        for (let i = 0; i < values.length; i++) if (values[i] > max) max = values[i];

        view.current.base = values;
        view.current.maxVal = max;
        // Run once: Bogo is randomised, so a second call would produce a
        // different log than the one the player is about to replay.
        const result = runSort(algo, values);
        setRun(result);
        runRef.current = result;

        resetView();
        player.rebind();
        draw();
        // Regeneration must not depend on the player or draw identities.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [algo, n, order, seed]);

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

    // -- report upward ------------------------------------------------------

    useEffect(() => {
        onControls({ toggle: player.toggle, step: player.stepOnce, reset: player.reset });
    }, [onControls, player.toggle, player.stepOnce, player.reset]);

    const total = run.steps.length;
    const progress = total === 0 ? 0 : Math.round((player.index / total) * 100);
    const finished = total > 0 && player.index >= total;
    const v = view.current;
    const counters =
        formatInt(v.comparisons) + ' compares · ' + formatInt(v.writes) + ' writes';

    useEffect(() => {
        onStatus({
            title: meta.label,
            subtitle: meta.average + ' average',
            tip: meta.note,
            counters,
            progress,
            playing: player.playing,
            finished,
        });
    }, [onStatus, meta.label, meta.average, meta.note, counters, progress, player.playing, finished]);

    return (
        <>
            <CrtFrame style={{ flex: 1, minHeight: 90 }}>
                <div ref={frameRef} style={styles.canvasHolder}>
                    <canvas ref={canvasRef} style={styles.canvas} />
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

export default SortingPanel;
