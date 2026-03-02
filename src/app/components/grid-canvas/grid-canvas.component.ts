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

    readonly photos = signal<(string | null)[]>([]);
    readonly isCollecting = signal<boolean>(false);
    readonly isDragOverCollection = signal<boolean>(false);

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

    /** Wrapper CSS styles for optional fixed sizes */
    protected readonly wrapperStyle = computed(() => {
        const cfg = this.config();
        const style: Record<string, string> = {};

        if (cfg.canvasWidth) {
            style['width'] = `${cfg.canvasWidth}px`;
            style['max-width'] = 'none';
        }
        if (cfg.canvasHeight) {
            style['height'] = `${cfg.canvasHeight}px`;
            style['max-height'] = 'none';
        }
        if (cfg.canvasWidth || cfg.canvasHeight) {
            style['aspect-ratio'] = 'auto';
            style['resize'] = 'none';
        }

        return style;
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
    protected readonly uploadedCount = computed(() =>
        this.photos().filter((p) => p !== null).length,
    );

    /** Auto-compute rows based on uploaded photos (grow grid as user adds photos) */
    private readonly autoRows = computed(() => {
        const count = Math.max(1, this.uploadedCount() + (this.isCollecting() ? 0 : 1)); // +1 for next empty slot only if not collecting
        const cols = this.autoCols();
        return Math.max(1, Math.ceil(count / cols));
    });

    private readonly autoCols = computed(() => {
        const count = Math.max(1, this.uploadedCount() + (this.isCollecting() ? 0 : 1));
        if (count <= 1) return 1;
        if (count <= 2) return 2;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        if (count <= 9) return 3;
        return 4;
    });

    constructor() {
        // Trigger auto collection when entering autoSize mode if empty
        effect(() => {
            if (this.config().autoSize && this.uploadedCount() === 0) {
                this.isCollecting.set(true);
            } else if (!this.config().autoSize) {
                this.isCollecting.set(false);
            }
        }, { allowSignalWrites: true });

        // Sync photos array size with grid dimensions
        effect(() => {
            if (this.config().autoSize && this.isCollecting()) {
                return; // Do not pad array while collecting in auto mode
            }

            const total = this.totalCells();
            const current = this.photos();
            if (current.length !== total) {
                const newPhotos = Array.from({ length: total }, (_, i) => current[i] ?? null);
                this.photos.set(newPhotos);
            }
        }, { allowSignalWrites: true });
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
        if (this.isCollecting()) {
            current.splice(index, 1);
        } else {
            current[index] = null;
        }
        this.photos.set(current);
    }

    clearAllPhotos(): void {
        if (this.isCollecting()) {
            this.photos.set([]);
        } else {
            this.photos.set(Array.from({ length: this.totalCells() }, () => null));
        }
    }

    startCollecting(): void {
        const justPhotos = this.photos().filter(p => p !== null);
        this.photos.set(justPhotos);
        this.isCollecting.set(true);
    }

    finishCollecting(): void {
        if (this.uploadedCount() > 0) {
            this.isCollecting.set(false);
            // The effect above will pad the array with a null spot
        }
    }

    onCollectionFilesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        this.processCollectionFiles(Array.from(input.files));
        input.value = '';
    }

    onCollectionDragOver(event: DragEvent): void {
        event.preventDefault();
        this.isDragOverCollection.set(true);
    }

    onCollectionDragLeave(event: DragEvent): void {
        event.preventDefault();
        // Ignore if entering a child element
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        if (
            event.clientX <= rect.left ||
            event.clientX >= rect.right ||
            event.clientY <= rect.top ||
            event.clientY >= rect.bottom
        ) {
            this.isDragOverCollection.set(false);
        }
    }

    onCollectionDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragOverCollection.set(false);
        if (!event.dataTransfer?.files?.length) return;

        const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        this.processCollectionFiles(files);
    }

    private processCollectionFiles(files: File[]): void {
        let processedCount = 0;
        const currentPhotos = [...this.photos().filter(p => p !== null)];

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                currentPhotos.push(reader.result as string);
                processedCount++;
                if (processedCount === files.length) {
                    this.photos.set(currentPhotos);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    async exportCanvas(): Promise<void> {
        const el = this.canvasRef()?.nativeElement;
        if (el) {
            await this.exportService.exportAsImage(el);
        }
    }
}
