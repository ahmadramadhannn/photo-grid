export enum ShapeType {
    None = 'none',
    Heart = 'heart',
    Star = 'star',
    Hexagon = 'hexagon',
    Triangle = 'triangle',
    Kite = 'kite',
}

export type GridMode = 'grid' | 'freestyle';

export interface GridConfig {
    rows: number;
    cols: number;
    gap: number;
    shape: ShapeType;
    mode: GridMode;
    autoSize: boolean;
    /** Template: per-cell shape overrides, keyed by cell index */
    template: GridTemplate | null;
}

export interface PhotoItem {
    id: string;
    file: File;
    previewUrl: string;
    /** Freestyle positioning */
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
}

/** Per-cell zoom state */
export interface CellZoom {
    scale: number;
    offsetX: number;
    offsetY: number;
}

/** A template defines per-cell shape overrides for a grid layout */
export interface GridTemplate {
    id: string;
    name: string;
    icon: string;
    rows: number;
    cols: number;
    /** Map of cell index → ShapeType override */
    cellShapes: Record<number, ShapeType>;
}

export const GRID_TEMPLATES: GridTemplate[] = [
    {
        id: 'checkerboard-hearts',
        name: 'Heart Check',
        icon: '♥♦',
        rows: 2,
        cols: 2,
        cellShapes: { 0: ShapeType.Heart, 1: ShapeType.None, 2: ShapeType.None, 3: ShapeType.Heart },
    },
    {
        id: 'diamond-ring',
        name: 'Diamond Ring',
        icon: '◇◆',
        rows: 3,
        cols: 3,
        cellShapes: {
            0: ShapeType.Triangle, 1: ShapeType.Kite, 2: ShapeType.Triangle,
            3: ShapeType.Hexagon, 4: ShapeType.Star, 5: ShapeType.Hexagon,
            6: ShapeType.Triangle, 7: ShapeType.Kite, 8: ShapeType.Triangle,
        },
    },
    {
        id: 'star-burst',
        name: 'Star Burst',
        icon: '✦✧',
        rows: 3,
        cols: 3,
        cellShapes: {
            0: ShapeType.Star, 1: ShapeType.Heart, 2: ShapeType.Star,
            3: ShapeType.Heart, 4: ShapeType.Hexagon, 5: ShapeType.Heart,
            6: ShapeType.Star, 7: ShapeType.Heart, 8: ShapeType.Star,
        },
    },
    {
        id: 'hex-grid',
        name: 'Hex Mosaic',
        icon: '⬡⬢',
        rows: 2,
        cols: 3,
        cellShapes: {
            0: ShapeType.Hexagon, 1: ShapeType.Hexagon, 2: ShapeType.Hexagon,
            3: ShapeType.Hexagon, 4: ShapeType.Hexagon, 5: ShapeType.Hexagon,
        },
    },
    {
        id: 'kite-flight',
        name: 'Kite Flight',
        icon: '◆◇',
        rows: 2,
        cols: 2,
        cellShapes: { 0: ShapeType.Kite, 1: ShapeType.Star, 2: ShapeType.Star, 3: ShapeType.Kite },
    },
    {
        id: 'arrow-4x4',
        name: 'Arrow Grid',
        icon: '▲▼',
        rows: 4,
        cols: 4,
        cellShapes: {
            0: ShapeType.Triangle, 1: ShapeType.None, 2: ShapeType.None, 3: ShapeType.Triangle,
            4: ShapeType.None, 5: ShapeType.Star, 6: ShapeType.Star, 7: ShapeType.None,
            8: ShapeType.None, 9: ShapeType.Heart, 10: ShapeType.Heart, 11: ShapeType.None,
            12: ShapeType.Kite, 13: ShapeType.None, 14: ShapeType.None, 15: ShapeType.Kite,
        },
    },
];

export const DEFAULT_GRID_CONFIG: GridConfig = {
    rows: 2,
    cols: 2,
    gap: 0,
    shape: ShapeType.None,
    mode: 'grid',
    autoSize: false,
    template: null,
};
