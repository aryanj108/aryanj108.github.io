// ─────────────────────────────────────────────────────────────────────────────
// Cross-app signalling for the desktop.
//
// Mirrors the 3D site's UIEventBus (a thin wrapper over document CustomEvents),
// with one addition: a module-level pendingRoute.
//
// The Contact shortcut can fire while the Showcase window is CLOSED, so no
// listener exists yet and a plain event would be dropped. The requested route
// is parked here instead, and whichever RouteBridge mounts next consumes it.
// ─────────────────────────────────────────────────────────────────────────────

const SHOWCASE_ROUTE_EVENT = 'showcase:navigate';

// CRA replaces this at build time ("/os" in production, "" in dev), same
// as the basename ShowcaseExplorer's <Router> uses.
const BASE = process.env.PUBLIC_URL || '';

let pendingRoute: string | null = null;

/** Ask the Showcase window to show `path`, whether or not it is open yet. */
export const requestShowcaseRoute = (path: string): void => {
    pendingRoute = path;
    document.dispatchEvent(
        new CustomEvent(SHOWCASE_ROUTE_EVENT, { detail: path })
    );
};

/** Take any route requested before the listener existed. */
export const consumePendingRoute = (): string | null => {
    const path = pendingRoute;
    pendingRoute = null;
    return path;
};

/** Subscribe to route requests. Returns an unsubscribe function. */
export const onShowcaseRoute = (
    handler: (path: string) => void
): (() => void) => {
    const listener = (event: Event) => {
        const path = (event as CustomEvent<string>).detail;
        if (typeof path === 'string') {
            pendingRoute = null;
            handler(path);
        }
    };
    document.addEventListener(SHOWCASE_ROUTE_EVENT, listener);
    return () => document.removeEventListener(SHOWCASE_ROUTE_EVENT, listener);
};

/**
 * Reset the browser's address bar to the Showcase root before a fresh
 * window is mounted.
 *
 * ShowcaseExplorer's <BrowserRouter> reads window.location once, at mount.
 * Because this is a real browser URL rather than app state, it survives
 * closing and reopening the window within the same page load — so without
 * this, reopening Showcase after having navigated to, say, /contact would
 * silently resume on /contact instead of starting over at Home.
 */
export const resetShowcaseRoute = (): void => {
    window.history.replaceState(null, '', `${BASE}/`);
};
