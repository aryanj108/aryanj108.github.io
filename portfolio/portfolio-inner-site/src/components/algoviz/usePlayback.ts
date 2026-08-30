// requestAnimationFrame playback over a precomputed step log.
//
// The host owns the render state and the canvas; this hook only decides which
// steps have been applied. Because the log is plain data, seeking backwards is
// just "reset and replay 0..k" - no inverse steps, and no chance of the render
// state drifting out of sync with the step index.

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PlaybackHost {
    /** Total number of steps in the current run. */
    total: () => number;
    /** Return the render state to its pre-run condition. */
    reset: () => void;
    /**
     * Fold step `i` into the render state. `silent` is set while scrubbing,
     * where replaying thousands of steps must not fire thousands of tones.
     */
    apply: (i: number, silent?: boolean) => void;
    /** Paint the current render state. */
    draw: () => void;
}

export interface Playback {
    index: number;
    playing: boolean;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    stepOnce: () => void;
    reset: () => void;
    seek: (to: number) => void;
    /** Re-read the host after its run changed; rewinds to the start. */
    rebind: () => void;
}

/** How often the step counter and stats readout refresh, in ms. */
const UI_REFRESH_MS = 90;

export function usePlayback(
    hostRef: React.MutableRefObject<PlaybackHost | null>,
    stepsPerFrame: number
): Playback {
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);

    const idxRef = useRef(0);
    const carryRef = useRef(0); // fractional step budget, for sub-1x speeds
    const rafRef = useRef<number | null>(null);
    const lastUiRef = useRef(0);
    const speedRef = useRef(stepsPerFrame);
    speedRef.current = stepsPerFrame;

    const stopLoop = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const tick = useCallback(() => {
        const host = hostRef.current;
        if (!host) {
            rafRef.current = null;
            setPlaying(false);
            return;
        }

        const total = host.total();
        carryRef.current += speedRef.current;
        let budget = Math.floor(carryRef.current);
        carryRef.current -= budget;

        while (budget > 0 && idxRef.current < total) {
            host.apply(idxRef.current);
            idxRef.current++;
            budget--;
        }
        host.draw();

        if (idxRef.current >= total) {
            setIndex(idxRef.current);
            setPlaying(false);
            rafRef.current = null;
            return;
        }

        const now = performance.now();
        if (now - lastUiRef.current > UI_REFRESH_MS) {
            lastUiRef.current = now;
            setIndex(idxRef.current);
        }
        rafRef.current = requestAnimationFrame(tick);
    }, [hostRef]);

    const play = useCallback(() => {
        const host = hostRef.current;
        if (!host) return;
        if (idxRef.current >= host.total()) {
            // Replaying from the end restarts rather than doing nothing.
            idxRef.current = 0;
            host.reset();
            host.draw();
            setIndex(0);
        }
        if (rafRef.current !== null) return;
        carryRef.current = 0;
        lastUiRef.current = 0;
        setPlaying(true);
        rafRef.current = requestAnimationFrame(tick);
    }, [hostRef, tick]);

    const pause = useCallback(() => {
        stopLoop();
        setPlaying(false);
        setIndex(idxRef.current);
    }, [stopLoop]);

    const toggle = useCallback(() => {
        if (rafRef.current !== null) pause();
        else play();
    }, [pause, play]);

    const stepOnce = useCallback(() => {
        const host = hostRef.current;
        if (!host) return;
        stopLoop();
        setPlaying(false);
        if (idxRef.current < host.total()) {
            host.apply(idxRef.current);
            idxRef.current++;
            host.draw();
        }
        setIndex(idxRef.current);
    }, [hostRef, stopLoop]);

    const reset = useCallback(() => {
        const host = hostRef.current;
        stopLoop();
        setPlaying(false);
        idxRef.current = 0;
        carryRef.current = 0;
        if (host) {
            host.reset();
            host.draw();
        }
        setIndex(0);
    }, [hostRef, stopLoop]);

    const seek = useCallback(
        (to: number) => {
            const host = hostRef.current;
            if (!host) return;
            stopLoop();
            setPlaying(false);
            const target = Math.max(0, Math.min(to, host.total()));
            host.reset();
            for (let i = 0; i < target; i++) host.apply(i, true);
            idxRef.current = target;
            carryRef.current = 0;
            host.draw();
            setIndex(target);
        },
        [hostRef, stopLoop]
    );

    const rebind = reset;

    // Closing the AlgoViz window mid-run must not leave a frame loop alive
    // calling into an unmounted component.
    useEffect(() => stopLoop, [stopLoop]);

    return { index, playing, play, pause, toggle, stepOnce, reset, seek, rebind };
}
