import { Component, input, signal, viewChild, ElementRef, inject, computed, effect } from '@angular/core';
import { GridConfig, ShapeType } from '../../models/grid.models';
import { PhotoCellComponent } from '../photo-cell/photo-cell.component';
import { ExportService } from '../../services/export.service';

@Component({
    selector: 'app-grid-canvas',
    imports: [PhotoCellComponent],
    templateUrl: './grid-canvas.component.html',
    styleUrl: './grid-canvas.component.css',
})
export class GridCanvasComponent {
    config = input.required<GridConfig>();

    protected readonly photos = signal<(string | null)[]>([]);
    private readonly canvasRef = viewChild<ElementRef<HTMLElement>>('canvasArea');
    private readonly exportService = inject(ExportService);

    /** Total number of cells derived from config */
    protected readonly totalCells = computed(() => this.config().rows * this.config().cols);

    /** Array of indices for template iteration */
    protected readonly cellIndices = computed(() =>
        Array.from({ length: this.totalCells() }, (_, i) => i),
    );

    /** Grid CSS styles derived from config */
    protected readonly gridStyle = computed(() => {
        const { rows, cols, gap } = this.config();
        return {
            'grid-template-columns': `repeat(${cols}, 1fr)`,
            'grid-template-rows': `repeat(${rows}, 1fr)`,
            gap: `${gap}px`,
        };
    });

    protected readonly currentShape = computed(() => this.config().shape);

    constructor() {
        // Sync photos array size with grid dimensions
        effect(() => {
            const total = this.totalCells();
            const current = this.photos();
            if (current.length !== total) {
                const newPhotos = Array.from({ length: total }, (_, i) => current[i] ?? null);
                this.photos.set(newPhotos);
            }
        });
    }

    onPhotoSelected(event: { index: number; file: File }): void {
        const reader = new FileReader();
        reader.onload = () => {
            const current = [...this.photos()];
            current[event.index] = reader.result as string;
            this.photos.set(current);
        };
        reader.readAsDataURL(event.file);
    }

    onPhotoRemoved(index: number): void {
        const current = [...this.photos()];
        current[index] = null;
        this.photos.set(current);
    }

    async exportCanvas(): Promise<void> {
        const el = this.canvasRef()?.nativeElement;
        if (el) {
            await this.exportService.exportAsImage(el);
        }
    }
}
