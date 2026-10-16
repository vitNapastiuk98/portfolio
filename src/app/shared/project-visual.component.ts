import { Component, input } from '@angular/core';
import { RuntimeGraphComponent } from './runtime-graph.component';

@Component({
  selector: 'app-project-visual',
  imports: [RuntimeGraphComponent],
  template: `
    @switch (slug()) {
      @case ('visual-kapital') {
        <div class="capital-dashboard">
          <div class="capital-dashboard__heading">
            <span>Portfolio</span><strong>Asset overview</strong>
          </div>
          <div class="capital-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="capital-allocation"><i></i><span>Allocation / Analysis</span></div>
        </div>
      }
      @case ('white-label-restaurant') {
        <div class="restaurant-console">
          <header><span>Restaurant website</span><strong>Content management</strong></header>
          <div class="restaurant-console__grid"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <footer><span>Menus / Events</span><strong>Reservations →</strong></footer>
        </div>
      }
      @case ('task-around-website') {
        <div class="task-map-visual">
          <header><span>TaskAround</span><strong>Local help, nearby</strong></header>
          <svg viewBox="0 0 360 240" aria-hidden="true">
            <path class="task-map-visual__street" d="M0 70H360 M0 170H360 M90 0V240 M260 0V240" />
            <path class="task-map-visual__route" d="M90 70H260V170H180" />
            <circle class="task-map-visual__pin" cx="90" cy="70" r="12" />
            <circle class="task-map-visual__pin" cx="260" cy="70" r="12" />
            <circle class="task-map-visual__pin" cx="180" cy="170" r="12" />
          </svg>
          <footer><span>Post a task</span><strong>Find work →</strong></footer>
        </div>
      }
      @default {
        <app-runtime-graph />
      }
    }
  `,
})
export class ProjectVisualComponent {
  readonly slug = input.required<string>();
}
