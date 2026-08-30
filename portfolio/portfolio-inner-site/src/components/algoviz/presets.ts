// Named presets, in place of raw sliders.
//
// Minesweeper offered Beginner / Intermediate / Expert rather than width and
// height spinners, and that is the single biggest simplification here: four
// sliders with live numeric readouts collapse into two menu sections.

export type SizeKey = 'small' | 'medium' | 'large';
export type TerrainKey = 'none' | 'some' | 'lots';
export type SpeedKey = 'slow' | 'normal' | 'fast' | 'instant';

export interface Choice<T extends string> {
    key: T;
    label: string;
}

export const SIZE_CHOICES: Choice<SizeKey>[] = [
    { key: 'small', label: 'Small' },
    { key: 'medium', label: 'Medium' },
    { key: 'large', label: 'Large' },
];

export const SPEED_CHOICES: Choice<SpeedKey>[] = [
    { key: 'slow', label: 'Slow' },
    { key: 'normal', label: 'Normal' },
    { key: 'fast', label: 'Fast' },
    { key: 'instant', label: 'Instant' },
];

/** Element count for the sorting board. */
export const SORT_SIZE: { [K in SizeKey]: number } = {
    small: 25,
    medium: 80,
    large: 200,
};

/** Cell edge in pixels for the pathfinding grid; smaller cells mean a bigger maze. */
export const GRID_CELL: { [K in SizeKey]: number } = {
    small: 24,
    medium: 16,
    large: 10,
};

/**
 * Steps applied per animation frame. Fractional values below 1 mean a step
 * every few frames, which is what makes Slow readable.
 */
export const SORT_SPEED: { [K in SpeedKey]: number } = {
    slow: 0.5,
    normal: 12,
    fast: 120,
    instant: 4000,
};

export const PATH_SPEED: { [K in SpeedKey]: number } = {
    slow: 0.5,
    normal: 8,
    fast: 60,
    instant: 3000,
};

export const TERRAIN_CHOICES: Choice<TerrainKey>[] = [
    { key: 'none', label: 'None' },
    { key: 'some', label: 'Some' },
    { key: 'lots', label: 'Lots' },
];

/**
 * Fraction of open cells seeded as heavy terrain. Without any, Dijkstra and A*
 * reduce to breadth-first search and the comparison between them is empty, so
 * this is the option that makes the weighted searches worth watching.
 */
export const TERRAIN_DENSITY: { [K in TerrainKey]: number } = {
    none: 0,
    some: 0.15,
    lots: 0.32,
};
