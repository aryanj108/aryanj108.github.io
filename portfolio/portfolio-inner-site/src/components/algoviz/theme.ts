// Palette for the AlgoViz CRT panel. The window chrome around it uses the
// shared Win95 colors from src/constants/colors.ts; only the inset
// "monitor" area departs from that, which is what makes the bars pop.

const AlgoVizTheme = {
    panelBg: '#0b0f14',
    panelEdge: '#05070a',
    gridLine: '#131c27',
    text: '#c9d6e4',
    textDim: '#7d8fa3',

    // sorting bar roles
    barLo: [24, 92, 112] as [number, number, number], // value ramp, low end
    barHi: [72, 236, 228] as [number, number, number], // value ramp, high end
    barCompare: '#ff3ea5',
    barPivot: '#ffc23c',
    barWrite: '#ffffff',
    barSorted: '#3cf05a',
    barRange: '#1b2836',

    // pathfinding cell roles
    cellWall: '#26344c',
    cellWallLit: '#3b4f70',
    cellWeight: '#5b4694',
    cellWeightLit: '#7c63c4',
    cellFrontier: '#2fe0d0',
    cellVisited: '#1d6fa8',
    cellPath: '#ffd640',
    cellStart: '#46f569',
    cellEnd: '#ff463a',
} as const;

export default AlgoVizTheme;
