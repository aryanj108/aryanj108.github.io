// Help > About AlgoViz, and Help > How to play.
//
// These replace the old AboutPanel, which carried two complexity tables, five
// group boxes, eight swatches and five paragraphs. Per-algorithm complexity now
// lives in the status strip instead, where it is always visible and costs no
// screen real estate.

import React from 'react';
import { Icon } from '../general';
import Dialog from './Dialog';
import AlgoVizTheme from './theme';

export interface AboutDialogProps {
    onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => (
    <Dialog title="About AlgoViz" onClose={onClose} width={332}>
        <div style={styles.aboutTop}>
            <Icon icon="algovizIcon" size={32} />
            <div style={styles.aboutText}>
                <p style={styles.product}>AlgoViz</p>
                <p style={styles.line}>Version 1.0</p>
            </div>
        </div>
        <div style={styles.rule} />
        <p style={styles.line}>Sorting and pathfinding, drawn one step at a time.</p>
        <p style={{ ...styles.line, marginTop: 10 }}>&copy; 2026 Aryan Jalota</p>
        <div style={styles.buttonRow}>
            <button type="button" className="site-button" style={styles.ok} onClick={onClose}>
                OK
            </button>
        </div>
    </Dialog>
);

export const HowToPlayDialog: React.FC<AboutDialogProps> = ({ onClose }) => (
    <Dialog title="How to play" onClose={onClose} width={392}>
        <p style={styles.line}>
            Pick a mode and an algorithm from the menus, then press Start. Step walks one
            operation at a time; New deals a fresh board.
        </p>
        <p style={{ ...styles.line, marginTop: 10 }}>
            In Pathfinding, drag on the grid to draw, and drag the green or red square to move
            an endpoint. Heavy terrain costs more to cross, which is what makes Dijkstra and A*
            behave differently from breadth-first search.
        </p>
        <div style={styles.rule} />
        <div style={styles.legend}>
            <Swatch color={AlgoVizTheme.barCompare} label="Comparing" />
            <Swatch color={AlgoVizTheme.barPivot} label="Pivot" />
            <Swatch color={AlgoVizTheme.barSorted} label="Settled" />
            <Swatch color={AlgoVizTheme.cellFrontier} label="Frontier" />
            <Swatch color={AlgoVizTheme.cellVisited} label="Explored" />
            <Swatch color={AlgoVizTheme.cellPath} label="Route" />
            <Swatch color={AlgoVizTheme.cellWeight} label="Heavy" />
            <Swatch color={AlgoVizTheme.cellWall} label="Wall" />
        </div>
        <div style={styles.buttonRow}>
            <button type="button" className="site-button" style={styles.ok} onClick={onClose}>
                OK
            </button>
        </div>
    </Dialog>
);

const Swatch: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div style={styles.swatchRow}>
        <span style={{ ...styles.chip, backgroundColor: color }} />
        <span style={styles.swatchLabel}>{label}</span>
    </div>
);

const styles: StyleSheetCSS = {
    aboutTop: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    aboutText: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 14,
    },
    product: {
        fontFamily: 'MSSerif',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    line: {
        fontFamily: 'MSSerif',
        fontSize: 11,
        lineHeight: 1.6,
        color: '#000',
    },
    rule: {
        display: 'flex',
        height: 1,
        margin: '12px 0',
        borderTop: '1px solid #86898d',
        borderBottom: '1px solid #ffffff',
        flexShrink: 0,
    },
    legend: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    swatchRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 5,
    },
    chip: {
        display: 'inline-block',
        width: 11,
        height: 11,
        marginRight: 6,
        border: '1px solid #2b2b2b',
    },
    swatchLabel: {
        fontFamily: 'MSSerif',
        fontSize: 11,
        color: '#000',
    },
    buttonRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    ok: {
        fontFamily: 'MSSerif',
        fontSize: 11,
        padding: '5px 10px',
        minWidth: 76,
    },
};

export default AboutDialog;
