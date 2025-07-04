import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

export interface CanvasToolEvent {
  type: 'tool-change' | 'save';
  data?: any;
}

export type CanvasTool = 'select' | 'hand';

@Component({
  selector: 'app-canvas-tools',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './canvas-tools.component.html',
  styleUrl: './canvas-tools.component.css'
})
export class CanvasToolsComponent implements OnInit {
  @Input() currentTool: CanvasTool = 'select';
  @Input() isModified: boolean = false;
  @Output() toolEvent = new EventEmitter<CanvasToolEvent>();

  ngOnInit(): void {
    // Component initialization
  }

  selectTool(tool: CanvasTool): void {
    this.currentTool = tool;
    this.toolEvent.emit({
      type: 'tool-change',
      data: { tool }
    });
  }

  save(): void {
    this.toolEvent.emit({
      type: 'save'
    });
  }

  getToolIcon(tool: CanvasTool): string {
    const iconMap: { [key in CanvasTool]: string } = {
      'select': 'near_me',
      'hand': 'pan_tool'
    };
    return iconMap[tool] || 'near_me';
  }

  getToolLabel(tool: CanvasTool): string {
    const labelMap: { [key in CanvasTool]: string } = {
      'select': 'designLab.tools.select',
      'hand': 'designLab.tools.hand'
    };
    return labelMap[tool] || 'designLab.tools.select';
  }
}
