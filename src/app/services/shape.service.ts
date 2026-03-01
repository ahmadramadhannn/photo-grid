import { Injectable } from '@angular/core';
import { ShapeType } from '../models/grid.models';

@Injectable({
    providedIn: 'root',
})
export class ShapeService {
    getClipPath(shape: ShapeType): string {
        switch (shape) {
            case ShapeType.Heart:
                return this.heartClipPath();
            case ShapeType.Star:
                return this.starClipPath();
            case ShapeType.Hexagon:
                return this.hexagonClipPath();
            case ShapeType.Triangle:
                return this.triangleClipPath();
            case ShapeType.Kite:
                return this.kiteClipPath();
            case ShapeType.None:
            default:
                return 'none';
        }
    }

    getShapeLabel(shape: ShapeType): string {
        const labels: Record<ShapeType, string> = {
            [ShapeType.None]: 'Square',
            [ShapeType.Heart]: 'Heart',
            [ShapeType.Star]: 'Star',
            [ShapeType.Hexagon]: 'Hexagon',
            [ShapeType.Triangle]: 'Triangle',
            [ShapeType.Kite]: 'Kite',
        };
        return labels[shape];
    }

    getShapeIcon(shape: ShapeType): string {
        const icons: Record<ShapeType, string> = {
            [ShapeType.None]: '⬜',
            [ShapeType.Heart]: '❤️',
            [ShapeType.Star]: '⭐',
            [ShapeType.Hexagon]: '⬡',
            [ShapeType.Triangle]: '▲',
            [ShapeType.Kite]: '◆',
        };
        return icons[shape];
    }

    private heartClipPath(): string {
        // Heart shape using SVG path data in clip-path
        return `path('M 0.5 0.18 C 0.5 0.08, 0.63 0, 0.78 0 C 0.93 0, 1 0.12, 1 0.25 C 1 0.55, 0.5 1, 0.5 1 C 0.5 1, 0 0.55, 0 0.25 C 0 0.12, 0.07 0, 0.22 0 C 0.37 0, 0.5 0.08, 0.5 0.18 Z')`;
    }

    private starClipPath(): string {
        // 5-point star
        const points: string[] = [];
        for (let i = 0; i < 10; i++) {
            const angle = (i * 36 - 90) * (Math.PI / 180);
            const radius = i % 2 === 0 ? 50 : 20;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            points.push(`${x}% ${y}%`);
        }
        return `polygon(${points.join(', ')})`;
    }

    private hexagonClipPath(): string {
        return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    }

    private triangleClipPath(): string {
        return 'polygon(50% 0%, 0% 100%, 100% 100%)';
    }

    private kiteClipPath(): string {
        return 'polygon(50% 0%, 100% 40%, 50% 100%, 0% 40%)';
    }
}
