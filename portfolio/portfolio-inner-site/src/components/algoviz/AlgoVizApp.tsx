// The AlgoViz shell: menu bar, board, three buttons, status strip.
//
// All settings live here rather than in the panels, because a single menu bar
// drives both modes. The panels are near-dumb renderers: they take settings as
// props, own only their canvas and playback engine, and report back through
// onStatus (reactive) and onControls (imperative).

import React, { useCallback, useEffect, useRef, useState } from 'react';
import AboutDialog, { HowToPlayDialog } from './AboutDialog';
import { closeAudio, ensureAudio } from './audio';
import MenuBar, { Menu, MenuItem } from './MenuBar';
import { MAZE_META, MazeKind } from './mazes';
import PathfindingPanel from './PathfindingPanel';
import { PATH_META } from './pathfinding';
import {
    Choice,
    SIZE_CHOICES,
    SizeKey,
    SPEED_CHOICES,
    SpeedKey,
    TERRAIN_CHOICES,
    TerrainKey,
} from './presets';
import { runSelfTest } from './selftest';
import SortingPanel from './SortingPanel';
import { SORT_META } from './sorting';
import { Brush, Distribution, PanelControls, PanelStatus, PathKey, SortKey } from './types';

type Mode = 'sorting' | 'pathfinding';
type DialogKind = 'about' | 'help' | null;

const ORDER_CHOICES: Choice<Distribution>[] = [
    { key: 'random', label: 'Random' },
    { key: 'nearly', label: 'Nearly sorted' },
    { key: 'reversed', label: 'Reversed' },
    { key: 'fewUnique', label: 'Few unique' },
];

const BRUSH_CHOICES: Choice<Brush>[] = [
    { key: 'wall', label: 'Walls' },
    { key: 'weight', label: 'Heavy terrain' },
    { key: 'erase', label: 'Erase' },
];

const IDLE_STATUS: PanelStatus = {
    title: '',
    subtitle: '',
    tip: '',
    counters: '',
    progress: 0,
    playing: false,
    finished: false,
};

export interface AlgoVizAppProps {
    width: number;
    height: number;
    onClose: () => void;
}

const AlgoVizApp: React.FC<AlgoVizAppProps> = ({ width, height, onClose }) => {
    const [mode, setMode] = useState<Mode>('sorting');
    const [sortAlgo, setSortAlgo] = useState<SortKey>('quick');
    const [pathAlgo, setPathAlgo] = useState<PathKey>('astar');
    const [size, setSize] = useState<SizeKey>('medium');
    const [speed, setSpeed] = useState<SpeedKey>('normal');
    const [order, setOrder] = useState<Distribution>('random');
    const [maze, setMaze] = useState<MazeKind>('backtracker');
    const [terrain, setTerrain] = useState<TerrainKey>('none');
    const [brush, setBrush] = useState<Brush>('wall');
    const [sound, setSound] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [dialog, setDialog] = useState<DialogKind>(null);

    // Bumped by Game > New to reshuffle the array or carve a fresh maze.
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

    const toggleSound = useCallback(() => {
        setSound((on) => {
            if (!on) ensureAudio(); // this click is the gesture that starts it
            return !on;
        });
    }, []);

    const newBoard = useCallback(() => setSeed((s) => s + 1), []);
    const run = useCallback(() => {
        ensureAudio();
        if (controls.current) controls.current.toggle();
    }, []);
    const step = useCallback(() => {
        if (controls.current) controls.current.step();
    }, []);
    const reset = useCallback(() => {
        if (controls.current) controls.current.reset();
    }, []);

    // -- menus --------------------------------------------------------------

    function radios<T extends string>(
        choices: Choice<T>[],
        current: T,
        set: (v: T) => void
    ): MenuItem[] {
        return choices.map((c) => ({
            kind: 'radio' as const,
            label: c.label,
            checked: current === c.key,
            onSelect: () => set(c.key),
        }));
    }

    const algoItems: MenuItem[] =
        mode === 'sorting'
            ? radios(
                  SORT_META.map((m) => ({ key: m.key, label: m.label })),
                  sortAlgo,
                  setSortAlgo
              )
            : radios(
                  PATH_META.map((m) => ({ key: m.key, label: m.label })),
                  pathAlgo,
                  setPathAlgo
              );

    const optionItems: MenuItem[] = [
        { kind: 'heading', label: 'Size' },
        ...radios(SIZE_CHOICES, size, setSize),
        { kind: 'separator' },
        { kind: 'heading', label: 'Speed' },
        ...radios(SPEED_CHOICES, speed, setSpeed),
        { kind: 'separator' },
    ];
    if (mode === 'sorting') {
        optionItems.push({ kind: 'heading', label: 'Starting order' });
        optionItems.push(...radios(ORDER_CHOICES, order, setOrder));
    } else {
        optionItems.push({ kind: 'heading', label: 'Maze' });
        optionItems.push(
            ...radios(
                MAZE_META.map((m) => ({ key: m.key, label: m.label })),
                maze,
                setMaze
            )
        );
        optionItems.push({ kind: 'separator' });
        optionItems.push({ kind: 'heading', label: 'Heavy terrain' });
        optionItems.push(...radios(TERRAIN_CHOICES, terrain, setTerrain));
        optionItems.push({ kind: 'separator' });
        optionItems.push({ kind: 'heading', label: 'Draw with' });
        optionItems.push(...radios(BRUSH_CHOICES, brush, setBrush));
    }
    optionItems.push({ kind: 'separator' });
    optionItems.push({
        kind: 'check',
        label: 'Show timeline',
        checked: showTimeline,
        onSelect: () => setShowTimeline((v) => !v),
    });

    const menus: Menu[] = [
        {
            label: 'Game',
            items: [
                { kind: 'action', label: 'New', onSelect: newBoard },
                {
                    kind: 'action',
                    label: status.playing ? 'Pause' : 'Start',
                    onSelect: run,
                },
                { kind: 'action', label: 'Step', onSelect: step, disabled: status.finished },
                { kind: 'action', label: 'Reset', onSelect: reset },
                { kind: 'separator' },
                {
                    kind: 'radio',
                    label: 'Sorting',
                    checked: mode === 'sorting',
                    onSelect: () => setMode('sorting'),
                },
                {
                    kind: 'radio',
                    label: 'Pathfinding',
                    checked: mode === 'pathfinding',
                    onSelect: () => setMode('pathfinding'),
                },
                { kind: 'separator' },
                { kind: 'check', label: 'Sound', checked: sound, onSelect: toggleSound },
                { kind: 'separator' },
                { kind: 'action', label: 'Close', onSelect: onClose },
            ],
        },
        { label: 'Algorithm', items: algoItems },
        { label: 'Options', items: optionItems },
        {
            label: 'Help',
            items: [
                { kind: 'action', label: 'How to play', onSelect: () => setDialog('help') },
                { kind: 'separator' },
                { kind: 'action', label: 'About AlgoViz', onSelect: () => setDialog('about') },
            ],
        },
    ];

    // -- render -------------------------------------------------------------

    return (
        <div style={styles.root}>
            <MenuBar menus={menus} />

            {mode === 'sorting' ? (
                <SortingPanel
                    width={width}
                    height={height}
                    algo={sortAlgo}
                    size={size}
                    speed={speed}
                    order={order}
                    sound={sound}
                    showTimeline={showTimeline}
                    seed={seed}
                    onStatus={setStatus}
                    onControls={onControls}
                />
            ) : (
                <PathfindingPanel
                    width={width}
                    height={height}
                    algo={pathAlgo}
                    size={size}
                    speed={speed}
                    maze={maze}
                    terrain={terrain}
                    brush={brush}
                    sound={sound}
                    showTimeline={showTimeline}
                    seed={seed}
                    onStatus={setStatus}
                    onControls={onControls}
                />
            )}

            <div style={styles.buttons}>
                <button type="button" className="site-button" style={styles.button} onClick={run}>
                    {status.playing ? 'Pause' : status.finished ? 'Replay' : 'Start'}
                </button>
                <button
                    type="button"
                    className="site-button"
                    style={styles.button}
                    onClick={step}
                    disabled={status.finished}
                >
                    Step
                </button>
                <button
                    type="button"
                    className="site-button"
                    style={styles.button}
                    onClick={newBoard}
                >
                    New
                </button>
            </div>

            <div style={styles.status}>
                <div style={styles.statusCell} title={status.tip}>
                    <b>{status.title}</b>
                    {status.subtitle ? (
                        <span style={styles.statusSubtitle}>{status.subtitle}</span>
                    ) : null}
                </div>
                <div style={{ ...styles.statusCell, ...styles.statusCounters }}>
                    {status.counters}
                </div>
                <div style={{ ...styles.statusCell, ...styles.statusProgress }}>
                    {status.progress}%
                </div>
            </div>

            {dialog === 'about' ? <AboutDialog onClose={() => setDialog(null)} /> : null}
            {dialog === 'help' ? <HowToPlayDialog onClose={() => setDialog(null)} /> : null}
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
        padding: 6,
        boxSizing: 'border-box',
        backgroundColor: '#c3c6ca',
        overflow: 'hidden',
    },
    buttons: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        marginTop: 6,
        marginBottom: 6,
    },
    button: {
        fontFamily: 'MSSerif',
        fontSize: 11,
        padding: '5px 10px',
        minWidth: 72,
        marginRight: 6,
    },
    status: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        flexShrink: 0,
        height: 20,
    },
    statusCell: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
        marginRight: 3,
        padding: '0 6px',
        fontFamily: 'MSSerif',
        fontSize: 11,
        color: '#000',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        border: '1px solid #ffffff',
        borderTopColor: '#86898d',
        borderLeftColor: '#86898d',
    },
    statusSubtitle: {
        marginLeft: 8,
        color: '#4c5257',
    },
    statusCounters: {
        flex: 1,
    },
    statusProgress: {
        flex: 0,
        marginRight: 0,
        minWidth: 46,
        justifyContent: 'flex-end',
    },
};

export default AlgoVizApp;
