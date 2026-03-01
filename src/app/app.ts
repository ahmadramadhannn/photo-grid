import { Component, signal, viewChild } from '@angular/core';
import { GridConfig, DEFAULT_GRID_CONFIG } from './models/grid.models';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { GridCanvasComponent } from './components/grid-canvas/grid-canvas.component';
import { FreestyleCanvasComponent } from './components/freestyle-canvas/freestyle-canvas.component';

@Component({
  selector: 'app-root',
  imports: [ToolbarComponent, GridCanvasComponent, FreestyleCanvasComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly config = signal<GridConfig>({ ...DEFAULT_GRID_CONFIG });

  private readonly gridCanvas = viewChild(GridCanvasComponent);
  private readonly freestyleCanvas = viewChild(FreestyleCanvasComponent);

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
}
