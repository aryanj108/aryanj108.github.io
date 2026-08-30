// What survives of the AlgoViz control kit.
//
// The Group / Select / Slider / Stat / Swatch / Caption / Tab primitives all
// went away with the move to a menu bar: their jobs are now done by menu items,
// the status strip, and the two dialogs. Only the CRT frame and one formatter
// are still shared.
//
// Note: App.css sets `div { display: flex }` globally, so containers here
// declare their display explicitly rather than relying on defaults.

import React from 'react';
import AlgoVizTheme from './theme';

const crtBase: React.CSSProperties = {
    display: 'flex',
    position: 'relative',
    background: AlgoVizTheme.panelBg,
    border: '1px solid #ffffff',
    borderTopColor: '#2b2b2b',
    borderLeftColor: '#2b2b2b',
    overflow: 'hidden',
};

/** The dark inset "monitor" that every visualization is drawn into. */
export const CrtFrame: React.FC<{ style?: React.CSSProperties }> = ({ children, style }) => (
    <div style={{ ...crtBase, ...style }}>
        {children}
        {/* Scanlines live in CSS rather than the canvas so the pixels stay crisp. */}
        <div
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                pointerEvents: 'none',
                backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.11) 0px, rgba(0,0,0,0.11) 1px, transparent 1px, transparent 3px)',
            }}
        />
    </div>
);

export function formatInt(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
