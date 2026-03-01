import { Component, input, signal, viewChild, ElementRef, inject, HostListener } from '@angular/core';
import { GridConfig, ShapeType } from '../../models/grid.models';
import { ShapeService } from '../../services/shape.service';
import { ExportService } from '../../services/export.service';

interface FreestylePhoto {
    id: string;
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
}

@Component({
    selector: 'app-freestyle-canvas',
    templateUrl: './freestyle-canvas.component.html',
    styleUrl: './freestyle-canvas.component.css',
})
export class FreestyleCanvasComponent {
    config = input.required<GridConfig>();

    protected readonly photos = signal<FreestylePhoto[]>([]);
    protected readonly selectedId = signal<string | null>(null);
    protected readonly isDragOverCanvas = signal(false);

    private readonly canvasRef = viewChild<ElementRef<HTMLElement>>('freestyleArea');
    private readonly shapeService = inject(ShapeService);
    private readonly exportService = inject(ExportService);

    private dragging: FreestylePhoto | null = null;
    private resizing: FreestylePhoto | null = null;
    private dragOffset = { x: 0, y: 0 };
    private nextZIndex = 1;

    get clipPath(): string {
        return this.shapeService.getClipPath(this.config().shape);
    }

    onCanvasClick(): void {
        this.selectedId.set(null);
    }

    // ─── File Upload ───
    onAddPhotos(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = () => {
            if (input.files) {
                Array.from(input.files).forEach((file) => this.addFile(file));
            }
        };
        input.click();
    }

    onCanvasDragOver(event: DragEvent): void {
        event.preventDefault();
        this.isDragOverCanvas.set(true);
    }

    onCanvasDragLeave(event: DragEvent): void {
        event.preventDefault();
        this.isDragOverCanvas.set(false);
    }

    onCanvasDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragOverCanvas.set(false);
        const files = event.dataTransfer?.files;
        if (files) {
            const canvasRect = this.canvasRef()?.nativeElement.getBoundingClientRect();
            Array.from(files)
                .filter((f) => f.type.startsWith('image/'))
                .forEach((file, i) => {
                    const x = canvasRect ? event.clientX - canvasRect.left - 75 + i * 30 : 50 + i * 30;
                    const y = canvasRect ? event.clientY - canvasRect.top - 75 + i * 30 : 50 + i * 30;
                    this.addFile(file, x, y);
                });
        }
    }

    private addFile(file: File, x = 50, y = 50): void {
        const reader = new FileReader();
        reader.onload = () => {
            const photo: FreestylePhoto = {
                id: crypto.randomUUID(),
                url: reader.result as string,
                x,
                y,
                width: 150,
                height: 150,
                rotation: 0,
                zIndex: this.nextZIndex++,
            };
            this.photos.update((p) => [...p, photo]);
        };
        reader.readAsDataURL(file);
    }

    // ─── Drag ───
    onPhotoDragStart(event: PointerEvent, photo: FreestylePhoto): void {
        event.preventDefault();
        event.stopPropagation();
        this.dragging = photo;
        this.selectedId.set(photo.id);

        const canvasRect = this.canvasRef()?.nativeElement.getBoundingClientRect();
        if (canvasRect) {
            this.dragOffset = {
                x: event.clientX - canvasRect.left - photo.x,
                y: event.clientY - canvasRect.top - photo.y,
            };
        }

        // Bring to front
        this.photos.update((photos) =>
            photos.map((p) =>
                p.id === photo.id ? { ...p, zIndex: this.nextZIndex++ } : p,
            ),
        );
    }

    @HostListener('window:pointermove', ['$event'])
    onPointerMove(event: PointerEvent): void {
        if (this.dragging) {
            const canvasRect = this.canvasRef()?.nativeElement.getBoundingClientRect();
            if (canvasRect) {
                const x = event.clientX - canvasRect.left - this.dragOffset.x;
                const y = event.clientY - canvasRect.top - this.dragOffset.y;
                const id = this.dragging.id;
                this.photos.update((photos) =>
                    photos.map((p) => (p.id === id ? { ...p, x, y } : p)),
                );
            }
        }
        if (this.resizing) {
            const canvasRect = this.canvasRef()?.nativeElement.getBoundingClientRect();
            if (canvasRect) {
                const w = Math.max(60, event.clientX - canvasRect.left - this.resizing.x);
                const h = Math.max(60, event.clientY - canvasRect.top - this.resizing.y);
                const id = this.resizing.id;
                this.photos.update((photos) =>
                    photos.map((p) => (p.id === id ? { ...p, width: w, height: h } : p)),
                );
            }
        }
    }

    @HostListener('window:pointerup')
    onPointerUp(): void {
        this.dragging = null;
        this.resizing = null;
    }

    // ─── Resize ───
    onResizeStart(event: PointerEvent, photo: FreestylePhoto): void {
        event.preventDefault();
        event.stopPropagation();
        this.resizing = photo;
        this.selectedId.set(photo.id);
    }

    // ─── Actions ───
    onRotate(photo: FreestylePhoto): void {
        const id = photo.id;
        this.photos.update((photos) =>
            photos.map((p) => (p.id === id ? { ...p, rotation: p.rotation + 15 } : p)),
        );
    }

    onRemovePhoto(photo: FreestylePhoto): void {
        this.photos.update((photos) => photos.filter((p) => p.id !== photo.id));
        this.selectedId.set(null);
    }

    async exportCanvas(): Promise<void> {
        // Deselect before export so UI chrome is hidden
        this.selectedId.set(null);

        // Give Angular a tick to update the DOM
        await new Promise((resolve) => setTimeout(resolve, 100));

        const el = this.canvasRef()?.nativeElement;
        if (el) {
            await this.exportService.exportAsImage(el);
        }
    }
}
