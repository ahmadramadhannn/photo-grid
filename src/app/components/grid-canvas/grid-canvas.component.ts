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

    /**
     * In auto-size mode, grid dimensions come from the number of uploaded photos.
     * Otherwise, they come from the config (or template override).
     */
    protected readonly effectiveRows = computed(() => {
        const cfg = this.config();
        if (cfg.template) return cfg.template.rows;
        if (cfg.autoSize) return this.autoRows();
        return cfg.rows;
    });

    protected readonly effectiveCols = computed(() => {
        const cfg = this.config();
        if (cfg.template) return cfg.template.cols;
        if (cfg.autoSize) return this.autoCols();
        return cfg.cols;
    });

    /** Total number of cells */
    protected readonly totalCells = computed(() => this.effectiveRows() * this.effectiveCols());

    /** Array of indices for template iteration */
    protected readonly cellIndices = computed(() =>
        Array.from({ length: this.totalCells() }, (_, i) => i),
    );

    /** Grid CSS styles */
    protected readonly gridStyle = computed(() => {
        const rows = this.effectiveRows();
        const cols = this.effectiveCols();
        const gap = this.config().gap;
        return {
            'grid-template-columns': `repeat(${cols}, 1fr)`,
            'grid-template-rows': `repeat(${rows}, 1fr)`,
            gap: `${gap}px`,
        };
    });

    /** Get shape for a given cell index (template may override global shape) */
    getCellShape(index: number): ShapeType {
        const template = this.config().template;
        if (template && template.cellShapes[index] !== undefined) {
            return template.cellShapes[index];
        }
        return this.config().shape;
    }

    /** Count of how many photos are actually uploaded */
    private readonly uploadedCount = computed(() =>
        this.photos().filter((p) => p !== null).length,
    );

    /** Auto-compute rows based on uploaded photos (grow grid as user adds photos) */
    private readonly autoRows = computed(() => {
        const count = Math.max(1, this.uploadedCount() + 1); // +1 for next empty slot
        const cols = this.autoCols();
        return Math.max(1, Math.ceil(count / cols));
    });

    private readonly autoCols = computed(() => {
        const count = Math.max(1, this.uploadedCount() + 1);
        if (count <= 1) return 1;
        if (count <= 2) return 2;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        if (count <= 9) return 3;
        return 4;
    });

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
