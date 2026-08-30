// Small Win95 control primitives shared by the AlgoViz panels.
//
// Note: App.css sets `div { display: flex }` globally, so every container here
// declares its display and direction explicitly rather than relying on defaults.

import React from 'react';
import AlgoVizTheme from './theme';

export interface OptionItem<T extends string> {
    value: T;
    label: string;
}

// -- containers -------------------------------------------------------------

export const Row: React.FC<{ style?: React.CSSProperties; wrap?: boolean }> = ({
    children,
    style,
    wrap,
}) => {
    const base: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: wrap ? 'wrap' : 'nowrap',
    };
    return <div style={{ ...base, ...style }}>{children}</div>;
};

export const Col: React.FC<{ style?: React.CSSProperties }> = ({ children, style }) => {
    const base: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
    return <div style={{ ...base, ...style }}>{children}</div>;
};

/** Sunken Win95 group box with an optional caption. */
export const Group: React.FC<{ title?: string; style?: React.CSSProperties }> = ({
    title,
    children,
    style,
}) => {
    const base: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #ffffff',
        borderTopColor: '#86898d',
        borderLeftColor: '#86898d',
        padding: 6,
    };
    return (
        <div style={{ ...base, ...style }}>
            {title ? <Caption>{title}</Caption> : null}
            {children}
        </div>
    );
};

export const Caption: React.FC = ({ children }) => (
    <span
        style={{
            fontFamily: 'MSSerif',
            fontSize: 11,
            color: '#000',
            marginBottom: 5,
            letterSpacing: 0.2,
        }}
    >
        {children}
    </span>
);

// -- inputs -----------------------------------------------------------------

interface SelectProps<T extends string> {
    value: T;
    options: OptionItem<T>[];
    onChange: (value: T) => void;
    width?: number;
    disabled?: boolean;
}

export function Select<T extends string>({
    value,
    options,
    onChange,
    width,
    disabled,
}: SelectProps<T>): React.ReactElement {
    return (
        <select
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value as T)}
            className="button-border"
            style={{
                fontFamily: 'MSSerif',
                fontSize: 11,
                padding: '2px 2px',
                width: width || 148,
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: '#000',
            }}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}

interface SliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    width?: number;
    disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
    value,
    min,
    max,
    step,
    onChange,
    width,
    disabled,
}) => (
    <input
        type="range"
        min={min}
        max={max}
        step={step || 1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
            width: width || 108,
            padding: 0,
            margin: 0,
            boxShadow: 'none',
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
        }}
    />
);

interface PushButtonProps {
    onClick: () => void;
    disabled?: boolean;
    primary?: boolean;
    width?: number;
    title?: string;
}

export const PushButton: React.FC<PushButtonProps> = ({
    onClick,
    disabled,
    primary,
    width,
    title,
    children,
}) => (
    <button
        type="button"
        title={title}
        disabled={disabled}
        onClick={onClick}
        className="site-button"
        style={{
            fontFamily: 'MSSerif',
            fontSize: 11,
            padding: '4px 8px',
            minWidth: width || 58,
            marginRight: 4,
            fontWeight: primary ? 'bold' : 'normal',
        }}
    >
        {children}
    </button>
);

/** Raised/pressed tab, used for the app's top-level mode switch. */
export const Tab: React.FC<{ active: boolean; onClick: () => void }> = ({
    active,
    onClick,
    children,
}) => (
    <button
        type="button"
        onClick={onClick}
        className={active ? '' : 'site-button'}
        style={{
            fontFamily: 'MSSerif',
            fontSize: 12,
            padding: '5px 16px',
            marginRight: 3,
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer',
            color: '#000',
            background: active ? '#e9e9e9' : undefined,
            boxShadow: active ? 'inset -1px -1px #ffffff, inset 1px 1px #2b2b2b' : undefined,
            fontWeight: active ? 'bold' : 'normal',
        }}
    >
        {children}
    </button>
);

// -- readouts ---------------------------------------------------------------

export const Stat: React.FC<{ label: string; value: string; wide?: boolean }> = ({
    label,
    value,
    wide,
}) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: wide ? 118 : 74,
            marginRight: 12,
        }}
    >
        <span style={{ fontFamily: 'MSSerif', fontSize: 10, color: '#4c5257' }}>{label}</span>
        <span style={{ fontFamily: 'MSSerif', fontSize: 13, color: '#000' }}>{value}</span>
    </div>
);

export const Swatch: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 12,
            marginBottom: 4,
        }}
    >
        <span
            style={{
                display: 'inline-block',
                width: 11,
                height: 11,
                background: color,
                border: '1px solid #2b2b2b',
                marginRight: 5,
            }}
        />
        <span style={{ fontFamily: 'MSSerif', fontSize: 11, color: '#000' }}>{label}</span>
    </div>
);

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
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)',
            }}
        />
    </div>
);

export function formatInt(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
