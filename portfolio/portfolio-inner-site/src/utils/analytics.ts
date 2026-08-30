// ─────────────────────────────────────────────────────────────────────────────
// Umami event tracking.
//
// The script is loaded from index.html and attaches window.umami. Ad blockers
// routinely block analytics domains, so window.umami is frequently undefined —
// every call goes through this helper so a blocked script never throws.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
    interface Window {
        umami?: {
            track: (
                event: string,
                data?: Record<string, unknown>
            ) => void;
        };
    }
}

export const track = (
    event: string,
    data?: Record<string, unknown>
): void => {
    try {
        window.umami?.track(event, data);
    } catch {
        // Analytics must never break the page.
    }
};

export default track;
