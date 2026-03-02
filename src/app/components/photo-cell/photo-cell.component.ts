import { Component, input, output, signal, inject, ElementRef, viewChild } from '@angular/core';
import { ShapeService } from '../../services/shape.service';
import { ShapeType, CellZoom } from '../../models/grid.models';

@Component({
    selector: 'app-photo-cell',
    templateUrl: './photo-cell.component.html',
    styleUrl: './photo-cell.component.css',
})
export class PhotoCellComponent {
    shape = input<ShapeType>(ShapeType.None);
    photoUrl = input<string | null>(null);
    cellIndex = input<number>(0);
    photoSelected = output<{ index: number; file: File }>();
    photoRemoved = output<number>();

    protected readonly isHovering = signal(false);
    protected readonly isDragOver = signal(false);
    protected readonly zoom = signal<CellZoom>({ scale: 1, offsetX: 0, offsetY: 0 });

    private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
    private readonly shapeService = inject(ShapeService);

    get clipPath(): string {
        return this.shapeService.getClipPath(this.shape());
    }

    get imageTransform(): string {
        const z = this.zoom();
        return `scale(${z.scale}) translate(${z.offsetX}px, ${z.offsetY}px)`;
    }

    onCellClick(): void {
        if (!this.photoUrl()) {
            this.fileInput()?.nativeElement.click();
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.photoSelected.emit({ index: this.cellIndex(), file: input.files[0] });
            input.value = '';
        }
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(true);
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);

        const files = event.dataTransfer?.files;
        if (files && files[0] && files[0].type.startsWith('image/')) {
            this.photoSelected.emit({ index: this.cellIndex(), file: files[0] });
        }
    }

    onReplace(): void {
        this.fileInput()?.nativeElement.click();
    }

    onRemove(event: Event): void {
        event.stopPropagation();
        this.photoRemoved.emit(this.cellIndex());
    }

    onZoomIn(event: Event): void {
        event.stopPropagation();
        this.zoom.update((z) => ({
            ...z,
            scale: Math.min(5, +(z.scale + 0.25).toFixed(2)),
        }));
    }

    onZoomOut(event: Event): void {
        event.stopPropagation();
        this.zoom.update((z) => ({
            ...z,
            scale: Math.max(0.25, +(z.scale - 0.25).toFixed(2)),
        }));
    }

    onResetZoom(event: Event): void {
        event.stopPropagation();
        this.zoom.set({ scale: 1, offsetX: 0, offsetY: 0 });
    }

    /** Scroll wheel to zoom */
    onWheel(event: WheelEvent): void {
        if (!this.photoUrl()) return;
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        this.zoom.update((z) => ({
            ...z,
            scale: Math.max(0.25, Math.min(5, +(z.scale + delta).toFixed(2))),
        }));
    }

    /** Pan the zoomed image */
    private isPanning = false;
    private panStart = { x: 0, y: 0 };

    onPanStart(event: PointerEvent): void {
        if (!this.photoUrl()) return;
        event.preventDefault();
        event.stopPropagation();
        this.isPanning = true;
        this.panStart = { x: event.clientX, y: event.clientY };
    }

    onPanMove(event: PointerEvent): void {
        if (!this.isPanning) return;
        event.preventDefault();
        const dx = (event.clientX - this.panStart.x) / this.zoom().scale;
        const dy = (event.clientY - this.panStart.y) / this.zoom().scale;
        this.panStart = { x: event.clientX, y: event.clientY };
        this.zoom.update((z) => ({
            ...z,
            offsetX: z.offsetX + dx,
            offsetY: z.offsetY + dy,
        }));
    }

    onPanEnd(): void {
        this.isPanning = false;
    }
}
