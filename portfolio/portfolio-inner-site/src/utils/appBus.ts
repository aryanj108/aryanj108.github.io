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
