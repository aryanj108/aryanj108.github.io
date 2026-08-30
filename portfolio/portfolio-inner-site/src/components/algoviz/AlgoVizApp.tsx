// The AlgoViz shell: an overview listing every algorithm, and a detail screen
// that runs one of them.
//
// The panels below are unchanged renderers — they own their canvas and playback
// engine and report back through onStatus (reactive) and onControls
// (imperative). Speed, terrain, brush, sound and the timeline are held at fixed
// defaults here rather than surfaced as controls; the panels still accept them,
// so re-exposing any of them is only a matter of adding a control.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { closeAudio, ensureAudio } from './audio';
import { MAZE_META, MazeKind } from './mazes';
import PathfindingPanel from './PathfindingPanel';
import { PATH_META } from './pathfinding';
import { SpeedKey, TerrainKey } from './presets';
import { runSelfTest } from './selftest';
import SortingPanel from './SortingPanel';
import { SORT_META } from './sorting';
import {
    Brush,
    Distribution,
    PanelControls,
    PanelStatus,
    PathKey,
    SortKey,
} from './types';

type Screen =
    | { kind: 'overview' }
    | { kind: 'sorting'; algo: SortKey }
    | { kind: 'pathfinding'; algo: PathKey };

// Held constant so the overview stays as simple as the reference design.
const SPEED: SpeedKey = 'normal';
const TERRAIN: TerrainKey = 'none';
const BRUSH: Brush = 'wall';
const SOUND = false;
const SHOW_TIMELINE = false;

const ORDER_CHOICES: { key: string; label: string }[] = [
    { key: 'random', label: 'Randomly distributed' },
    { key: 'nearly', label: 'Nearly sorted' },
    { key: 'reversed', label: 'Reversed' },
    { key: 'fewUnique', label: 'Few unique' },
];

const POINTS_MIN = 5;
const POINTS_MAX = 400;
const AREA_MIN = 5;
const AREA_MAX = 120;

const IDLE_STATUS: PanelStatus = {
    title: '',
    subtitle: '',
    tip: '',
    counters: '',
    progress: 0,
    playing: false,
    finished: false,
};

const clamp = (n: number, lo: number, hi: number) =>
    Number.isNaN(n) ? lo : Math.min(hi, Math.max(lo, n));

export interface AlgoVizAppProps {
    width: number;
    height: number;
    onClose: () => void;
}

const AlgoVizApp: React.FC<AlgoVizAppProps> = ({ width, height }) => {
    const [screen, setScreen] = useState<Screen>({ kind: 'overview' });
    const [order, setOrder] = useState<Distribution>('random');
    const [maze, setMaze] = useState<MazeKind>('backtracker');
    const [points, setPoints] = useState(50);
    const [areaW, setAreaW] = useState(40);
    const [areaH, setAreaH] = useState(20);

    // Bumped to reshuffle the array or carve a fresh maze.
    const [seed, setSeed] = useState(0);
    const [status, setStatus] = useState<PanelStatus>(IDLE_STATUS);
    const controls = useRef<PanelControls | null>(null);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') runSelfTest();
        return closeAudio; // release the audio hardware when the window closes
    }, []);

    const onControls = useCallback((c: PanelControls) => {
        controls.current = c;
    }, []);

    const regenerate = useCallback(() => setSeed((s) => s + 1), []);

    const run = useCallback(() => {
        ensureAudio();
        if (controls.current) controls.current.toggle();
    }, []);

    const backToOverview = useCallback(() => {
        controls.current = null;
        setStatus(IDLE_STATUS);
        setScreen({ kind: 'overview' });
    }, []);

    // -- shared option controls ---------------------------------------------

    const strategyRow = (
        label: string,
        value: string,
        onChange: (v: string) => void,
        options: { key: string; label: string }[]
    ) => (
        <div style={styles.field}>
            <label style={styles.fieldLabel}>{label}</label>
            <select
                style={styles.select}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((o) => (
                    <option key={o.key} value={o.key}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const numberRow = (
        label: string,
        value: number,
        onChange: (v: number) => void,
        lo: number,
        hi: number
    ) => (
        <div style={styles.field}>
            <label style={styles.fieldLabel}>{label}</label>
            <input
                style={styles.input}
                type="number"
                min={lo}
                max={hi}
                value={value}
                onChange={(e) =>
                    onChange(clamp(parseInt(e.target.value, 10), lo, hi))
                }
            />
        </div>
    );

    const sortingOptions = (
        <>
            {strategyRow(
                'Data generation strategy',
                order,
                (v) => setOrder(v as Distribution),
                ORDER_CHOICES
            )}
            {numberRow(
                'Data generation points',
                points,
                setPoints,
                POINTS_MIN,
                POINTS_MAX
            )}
        </>
    );

    const pathOptions = (
        <>
            {strategyRow(
                'Data generation strategy',
                maze,
                (v) => setMaze(v as MazeKind),
                MAZE_META.map((m) => ({ key: m.key as string, label: m.label }))
            )}
            {numberRow(
                'Path finding area width',
                areaW,
                setAreaW,
                AREA_MIN,
                AREA_MAX
            )}
            {numberRow(
                'Path finding area height',
                areaH,
                setAreaH,
                AREA_MIN,
                AREA_MAX
            )}
        </>
    );

    // -- overview -----------------------------------------------------------

    if (screen.kind === 'overview') {
        return (
            <div style={styles.root}>
                <div style={styles.scroll}>
                    <h1 style={styles.heading}>Sorting</h1>
                    <div style={styles.buttonRow}>
                        {SORT_META.map((m) => (
                            <button
                                key={m.key}
                                type="button"
                                className="site-button"
                                style={styles.pickButton}
                                onClick={() =>
                                    setScreen({ kind: 'sorting', algo: m.key })
                                }
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    <h3 style={styles.subheading}>Sorting options</h3>
                    {sortingOptions}

                    <h1 style={styles.heading}>Path finding</h1>
                    <div style={styles.buttonRow}>
                        {PATH_META.map((m) => (
                            <button
                                key={m.key}
                                type="button"
                                className="site-button"
                                style={styles.pickButton}
                                onClick={() =>
                                    setScreen({
                                        kind: 'pathfinding',
                                        algo: m.key,
                                    })
                                }
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    <h3 style={styles.subheading}>Path finding options</h3>
                    {pathOptions}
                </div>
            </div>
        );
    }

    // -- detail -------------------------------------------------------------

    const isSorting = screen.kind === 'sorting';
    const title = isSorting
        ? SORT_META.find((m) => m.key === screen.algo)?.label
        : PATH_META.find((m) => m.key === screen.algo)?.label;

    return (
        <div style={styles.root}>
            {screen.kind === 'sorting' ? (
                <SortingPanel
                    width={width}
                    height={height}
                    algo={screen.algo}
                    pointCount={points}
                    speed={SPEED}
                    order={order}
                    sound={SOUND}
                    showTimeline={SHOW_TIMELINE}
                    seed={seed}
                    onStatus={setStatus}
                    onControls={onControls}
                />
            ) : (
                <PathfindingPanel
                    width={width}
                    height={height}
                    algo={screen.algo}
                    cols={areaW}
                    rows={areaH}
                    speed={SPEED}
                    maze={maze}
                    terrain={TERRAIN}
                    brush={BRUSH}
                    sound={SOUND}
                    showTimeline={SHOW_TIMELINE}
                    seed={seed}
                    onStatus={setStatus}
                    onControls={onControls}
                />
            )}

            <div style={styles.detailPanel}>
                <h3 style={styles.detailTitle}>{title}</h3>
                <button
                    type="button"
                    className="site-button"
                    style={styles.actionButton}
                    onClick={run}
                >
                    {status.playing
                        ? 'Pause'
                        : status.finished
                        ? 'Replay'
                        : 'Start'}
                </button>

                <div style={styles.rule} />

                <button
                    type="button"
                    className="site-button"
                    style={styles.actionButton}
                    onClick={regenerate}
                >
                    Regenerate
                </button>

                {isSorting ? sortingOptions : pathOptions}

                <button
                    type="button"
                    style={styles.back}
                    onClick={backToOverview}
                >
                    Return to overview
                </button>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        padding: 10,
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    scroll: {
        flexDirection: 'column',
        overflowY: 'auto',
        width: '100%',
        height: '100%',
    },
    heading: {
        marginBottom: 8,
    },
    subheading: {
        marginTop: 14,
        marginBottom: 6,
    },
    buttonRow: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    pickButton: {
        fontFamily: 'MSSerif',
        fontSize: 11,
        padding: '5px 10px',
        marginRight: 6,
        marginBottom: 6,
    },
    detailPanel: {
        flexDirection: 'column',
        flexShrink: 0,
        paddingTop: 10,
        overflowY: 'auto',
    },
    detailTitle: {
        marginBottom: 6,
    },
    actionButton: {
        fontFamily: 'MSSerif',
        fontSize: 11,
        padding: '5px 10px',
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    rule: {
        height: 1,
        width: '100%',
        backgroundColor: '#c3c6ca',
        marginTop: 4,
        marginBottom: 10,
    },
    field: {
        alignItems: 'center',
        marginBottom: 6,
    },
    fieldLabel: {
        fontFamily: 'MSSerif',
        fontSize: 12,
        marginRight: 10,
    },
    select: {
        fontFamily: 'MSSerif',
        fontSize: 12,
    },
    input: {
        fontFamily: 'MSSerif',
        fontSize: 12,
        width: 70,
    },
    back: {
        marginTop: 10,
        fontFamily: 'MSSerif',
        fontSize: 12,
        color: '#0000ee',
        textDecoration: 'underline',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        alignSelf: 'flex-start',
    },
};

export default AlgoVizApp;
