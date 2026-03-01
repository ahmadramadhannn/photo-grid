import { Component, input, output, signal, inject, ElementRef, viewChild } from '@angular/core';
import { ShapeService } from '../../services/shape.service';
import { ShapeType } from '../../models/grid.models';

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

    private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
    private readonly shapeService = inject(ShapeService);

    get clipPath(): string {
        return this.shapeService.getClipPath(this.shape());
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
}
