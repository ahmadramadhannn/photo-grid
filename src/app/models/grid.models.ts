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

export const DEFAULT_GRID_CONFIG: GridConfig = {
    rows: 2,
    cols: 2,
    gap: 4,
    shape: ShapeType.None,
    mode: 'grid',
};
