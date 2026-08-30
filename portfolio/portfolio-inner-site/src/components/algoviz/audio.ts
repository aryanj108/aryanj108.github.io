// A single shared AudioContext for the whole app.
//
// The prototype created a context lazily but never resumed it (browsers start
// one suspended until a user gesture, so it stayed silent), never bounded how
// often it fired, and never closed it. All three are handled here.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let lastToneAt = 0;

/** Minimum gap between tones; without it fast playback machine-guns. */
const THROTTLE_MS = 16;

// `typeof window`, not `Window`: the AudioContext constructor lives on
// `typeof globalThis`, and naming the `Window` interface alone drops it.
type AudioWindow = typeof window & { webkitAudioContext?: typeof AudioContext };

/** Call from a click handler — that gesture is what lets the context start. */
export function ensureAudio(): void {
    try {
        if (!ctx) {
            const w = window as AudioWindow;
            const Ctor = w.AudioContext || w.webkitAudioContext;
            if (!Ctor) return;
            ctx = new Ctor();
            master = ctx.createGain();
            master.gain.value = 0.5;
            master.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') {
            void ctx.resume();
        }
    } catch {
        ctx = null;
        master = null;
    }
}

/**
 * Play a short square-wave blip. `norm` is 0..1 and maps to 180..900 Hz, so
 * taller bars / costlier cells sound higher.
 */
export function playTone(norm: number): void {
    if (!ctx || !master || ctx.state !== 'running') return;

    const now = performance.now();
    if (now - lastToneAt < THROTTLE_MS) return;
    lastToneAt = now;

    try {
        const clamped = norm < 0 ? 0 : norm > 1 ? 1 : norm;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime;

        osc.type = 'square';
        osc.frequency.value = 180 + clamped * 720;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.09, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);

        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + 0.09);
    } catch {
        // A failed blip is never worth interrupting the visualization for.
    }
}

/** Release the hardware when the app window closes. */
export function closeAudio(): void {
    const dying = ctx;
    ctx = null;
    master = null;
    if (dying && dying.state !== 'closed') {
        try {
            void dying.close();
        } catch {
            /* already gone */
        }
    }
}
