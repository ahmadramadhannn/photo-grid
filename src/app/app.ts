import { Component, signal, viewChild, computed } from '@angular/core';
import { GridConfig, DEFAULT_GRID_CONFIG } from './models/grid.models';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { GridCanvasComponent } from './components/grid-canvas/grid-canvas.component';
import { FreestyleCanvasComponent } from './components/freestyle-canvas/freestyle-canvas.component';
import { PhotoDrawerComponent } from './components/photo-drawer/photo-drawer.component';

@Component({
  selector: 'app-root',
  imports: [ToolbarComponent, GridCanvasComponent, FreestyleCanvasComponent, PhotoDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly config = signal<GridConfig>({ ...DEFAULT_GRID_CONFIG });

  protected readonly gridCanvas = viewChild(GridCanvasComponent);
  private readonly freestyleCanvas = viewChild(FreestyleCanvasComponent);

  /** Computed photos list — falls back to empty array if gridCanvas not yet resolved */
  protected readonly gridPhotos = computed<(string | null)[]>(() =>
    this.gridCanvas()?.photos() ?? [],
  );

  /** True when at least one photo has been added to the grid */
  protected readonly hasPhotos = computed(() =>
    this.gridPhotos().some(p => p !== null),
  );

  onConfigChange(newConfig: GridConfig): void {
    this.config.set({ ...newConfig });
  }

  async onExport(): Promise<void> {
    if (this.config().mode === 'grid') {
      await this.gridCanvas()?.exportCanvas();
    } else {
      await this.freestyleCanvas()?.exportCanvas();
    }
  }

  onDrawerPhotoRemoved(index: number): void {
    this.gridCanvas()?.onPhotoRemoved(index);
  }

  onDrawerClearAll(): void {
    this.gridCanvas()?.clearAllPhotos();
  }
}
