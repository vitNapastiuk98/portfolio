import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { StudyDiagram } from '../models/study.models';

@Component({
  selector: 'app-study-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="system-diagram">
      <div
        class="system-diagram__scroll"
        tabindex="0"
        role="region"
        [attr.aria-label]="diagram().title + ' — scroll diagram'"
      >
        <svg
          [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
          role="img"
          [attr.aria-labelledby]="diagram().id + '-title ' + diagram().id + '-description'"
        >
          <title [id]="diagram().id + '-title'">{{ diagram().title }}</title>
          <desc [id]="diagram().id + '-description'">{{ description() }}</desc>
          <defs>
            <marker
              [id]="diagram().id + '-arrow'"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>
          @for (edge of edges(); track $index) {
            <path
              [attr.d]="edge.path"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              [attr.marker-end]="'url(#' + diagram().id + '-arrow)'"
            />
            @if (edge.label) {
              <text class="edge-label" [attr.x]="edge.x" [attr.y]="edge.y">{{ edge.label }}</text>
            }
          }
          @for (node of nodes(); track node.id) {
            <g [attr.transform]="'translate(' + node.x + ' ' + node.y + ')'">
              <rect width="200" height="80" rx="0" />
              <text x="100" y="32" class="node-label">{{ node.label }}</text>
              <text x="100" y="56" class="node-detail">{{ node.detail }}</text>
            </g>
          }
        </svg>
      </div>
      <figcaption>{{ diagram().caption }}</figcaption>
    </figure>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    figure {
      margin: 2rem 0;
      padding: 1rem;
      border: 1px solid var(--rule);
      background: var(--panel);
    }
    .system-diagram__scroll {
      overflow-x: auto;
    }
    svg {
      display: block;
      width: 100%;
      min-width: 620px;
      color: var(--orange);
    }
    rect {
      fill: var(--night);
      stroke: var(--rule);
    }
    text {
      text-anchor: middle;
      font-family: var(--mono);
    }
    .node-label {
      fill: var(--paper);
      font-size: 13px;
    }
    .node-detail {
      fill: var(--muted);
      font-size: 11px;
    }
    .edge-label {
      fill: var(--paper);
      font-size: 10px;
      paint-order: stroke;
      stroke: var(--night);
      stroke-width: 5px;
    }
    figcaption {
      margin-top: 1rem;
      color: var(--muted);
      font-size: 0.8rem;
      line-height: 1.7;
    }
    .system-diagram__scroll:focus-visible {
      outline: 2px solid var(--orange);
      outline-offset: 3px;
    }
  `,
})
export class StudyDiagramComponent {
  readonly diagram = input.required<StudyDiagram>();
  readonly columns = computed(() => this.diagram().columns ?? 3);
  readonly width = computed(() => this.columns() * 240 + 20);
  readonly height = computed(
    () => Math.ceil(this.diagram().nodes.length / this.columns()) * 150 + 35,
  );
  readonly nodes = computed(() =>
    this.diagram().nodes.map((node, index) => ({
      ...node,
      x: 20 + (index % this.columns()) * 240,
      y: 30 + Math.floor(index / this.columns()) * 150,
    })),
  );
  readonly edges = computed(() =>
    this.diagram().edges.flatMap((edge) => {
      const from = this.nodes().find((node) => node.id === edge.from);
      const to = this.nodes().find((node) => node.id === edge.to);
      if (!from || !to) return [];
      const sameRow = from.y === to.y;
      const forward = to.x > from.x;
      const sx = sameRow ? from.x + (forward ? 200 : 0) : from.x + 100;
      const sy = sameRow ? from.y + 40 : from.y + (to.y > from.y ? 80 : 0);
      const tx = sameRow ? to.x + (forward ? 0 : 200) : to.x + 100;
      const ty = sameRow ? to.y + 40 : to.y + (to.y > from.y ? 0 : 80);
      const path =
        sameRow && Math.abs(from.x - to.x) > 240
          ? `M ${sx} ${sy} V ${from.y + 110} H ${tx} V ${ty}`
          : `M ${sx} ${sy} L ${tx} ${ty}`;
      return [{ ...edge, path, x: (sx + tx) / 2, y: sameRow ? sy - 10 : (sy + ty) / 2 - 8 }];
    }),
  );
  readonly description = computed(() =>
    [
      ...this.diagram().nodes.map((node) => `${node.label}: ${node.detail}.`),
      ...this.diagram().edges.map(
        (edge) =>
          `${this.diagram().nodes.find((n) => n.id === edge.from)?.label} to ${this.diagram().nodes.find((n) => n.id === edge.to)?.label}${edge.label ? ': ' + edge.label : ''}.`,
      ),
    ].join(' '),
  );
}
