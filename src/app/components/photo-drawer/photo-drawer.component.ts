import { Component, input, output, signal, computed } from '@angular/core';

interface DrawerPhoto {
    index: number;
    url: string;
}

@Component({
    selector: 'app-photo-drawer',
    templateUrl: './photo-drawer.component.html',
    styleUrl: './photo-drawer.component.css',
})
export class PhotoDrawerComponent {
    photos = input.required<(string | null)[]>();
    photoRemoved = output<number>();
    allPhotosCleared = output<void>();

    protected readonly isOpen = signal(false);

    protected readonly uploadedPhotos = computed<DrawerPhoto[]>(() =>
        this.photos()
            .map((url, index) => (url ? { index, url } : null))
            .filter((p): p is DrawerPhoto => p !== null),
    );

    protected readonly uploadedCount = computed(() => this.uploadedPhotos().length);

    toggle(): void {
        this.isOpen.update((v) => !v);
    }

    onRemovePhoto(index: number): void {
        this.photoRemoved.emit(index);
    }

    onClearAll(): void {
        this.allPhotosCleared.emit();
    }
}
