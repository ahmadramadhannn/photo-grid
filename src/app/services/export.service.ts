import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    private readonly document = inject(DOCUMENT);

    async exportAsImage(element: HTMLElement, fileName = 'photo-grid.png'): Promise<void> {
        const { default: html2canvas } = await import('html2canvas-pro');

        const canvas = await html2canvas(element, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
        });

        const link = this.document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    }
}
