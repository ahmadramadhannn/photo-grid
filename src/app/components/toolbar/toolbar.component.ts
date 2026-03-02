import { Component, input, output } from '@angular/core';
import {
    ShapeType,
    GridConfig,
    GridMode,
    GridTemplate,
    DEFAULT_GRID_CONFIG,
    GRID_TEMPLATES,
} from '../../models/grid.models';
import { ShapeService } from '../../services/shape.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-toolbar',
    imports: [FormsModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
    config = input<GridConfig>(DEFAULT_GRID_CONFIG);
    configChange = output<GridConfig>();
    exportRequest = output<void>();

    readonly shapeTypes = Object.values(ShapeType);
    readonly presetGrids = [
        { label: '2×2', rows: 2, cols: 2 },
        { label: '3×3', rows: 3, cols: 3 },
        { label: '4×4', rows: 4, cols: 4 },
        { label: '2×3', rows: 2, cols: 3 },
        { label: '3×2', rows: 3, cols: 2 },
    ];
    readonly templates = GRID_TEMPLATES;

    customRows = 2;
    customCols = 2;

    constructor(readonly shapeService: ShapeService) { }

    selectPreset(rows: number, cols: number): void {
        this.emitConfig({ rows, cols, autoSize: false, template: null });
    }

    applyCustomSize(): void {
        const rows = Math.max(1, Math.min(10, this.customRows));
        const cols = Math.max(1, Math.min(10, this.customCols));
        this.emitConfig({ rows, cols, autoSize: false, template: null });
    }

    selectShape(shape: ShapeType): void {
        this.emitConfig({ shape, template: null });
    }

    toggleMode(): void {
        const newMode: GridMode = this.config().mode === 'grid' ? 'freestyle' : 'grid';
        this.emitConfig({ mode: newMode });
    }

    toggleAutoSize(): void {
        this.emitConfig({ autoSize: !this.config().autoSize, template: null });
    }

    selectTemplate(template: GridTemplate): void {
        const current = this.config().template;
        if (current && current.id === template.id) {
            // Deselect
            this.emitConfig({ template: null });
        } else {
            this.emitConfig({
                template,
                rows: template.rows,
                cols: template.cols,
                autoSize: false,
            });
        }
    }

    updateGap(gap: number): void {
        this.emitConfig({ gap: Math.max(0, Math.min(32, gap)) });
    }

    onExport(): void {
        this.exportRequest.emit();
    }

    private emitConfig(partial: Partial<GridConfig>): void {
        this.configChange.emit({ ...this.config(), ...partial });
    }
}
