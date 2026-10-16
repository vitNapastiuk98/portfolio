import { Component } from '@angular/core';

@Component({
  selector: 'app-runtime-graph',
  template: `
    <div class="runtime-graph" aria-hidden="true">
      <svg viewBox="0 0 700 500">
        <defs>
          <marker
            id="runtime-edge-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path class="runtime-graph__arrow" d="M0 0 L8 4 L0 8 Z" />
          </marker>
        </defs>

        <path
          class="runtime-graph__edge"
          d="M200 250 C220 180 225 125 245 108"
          marker-end="url(#runtime-edge-arrow)"
        />
        <path
          class="runtime-graph__edge"
          d="M200 250 C218 320 220 372 225 388"
          marker-end="url(#runtime-edge-arrow)"
        />
        <path
          class="runtime-graph__edge"
          d="M455 108 C490 130 505 190 520 250"
          marker-end="url(#runtime-edge-arrow)"
        />
        <path
          class="runtime-graph__edge"
          d="M495 388 C510 365 515 305 520 250"
          marker-end="url(#runtime-edge-arrow)"
        />

        <circle class="runtime-graph__pulse" r="5" opacity="0">
          <animateMotion
            path="M200 250 C220 180 225 125 245 108"
            dur="5s"
            begin="0s"
            keyPoints="0;0;1;1"
            keyTimes="0;0.06;0.46;1"
            calcMode="spline"
            keySplines="0 0 1 1;0.35 0 0.25 1;0 0 1 1"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;1;1;0;0"
            keyTimes="0;0.06;0.12;0.4;0.46;1"
            dur="5s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>
        <circle class="runtime-graph__pulse" r="5" opacity="0">
          <animateMotion
            path="M200 250 C218 320 220 372 225 388"
            dur="5s"
            begin="0s"
            keyPoints="0;0;1;1"
            keyTimes="0;0.06;0.46;1"
            calcMode="spline"
            keySplines="0 0 1 1;0.35 0 0.25 1;0 0 1 1"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;1;1;0;0"
            keyTimes="0;0.06;0.12;0.4;0.46;1"
            dur="5s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>
        <circle class="runtime-graph__pulse" r="5" opacity="0">
          <animateMotion
            path="M455 108 C490 130 505 190 520 250"
            dur="5s"
            begin="0s"
            keyPoints="0;0;1;1"
            keyTimes="0;0.5;0.9;1"
            calcMode="spline"
            keySplines="0 0 1 1;0.35 0 0.25 1;0 0 1 1"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;1;1;0;0"
            keyTimes="0;0.5;0.56;0.84;0.9;1"
            dur="5s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>
        <circle class="runtime-graph__pulse" r="5" opacity="0">
          <animateMotion
            path="M495 388 C510 365 515 305 520 250"
            dur="5s"
            begin="0s"
            keyPoints="0;0;1;1"
            keyTimes="0;0.5;0.9;1"
            calcMode="spline"
            keySplines="0 0 1 1;0.35 0 0.25 1;0 0 1 1"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;1;1;0;0"
            keyTimes="0;0.5;0.56;0.84;0.9;1"
            dur="5s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>

        <g class="runtime-graph__node runtime-graph__node--signal">
          <rect x="20" y="207" width="180" height="86" />
          <text x="110" y="250">
            <tspan class="runtime-graph__bracket">&lt;</tspan>
            <tspan>signal()</tspan>
            <tspan class="runtime-graph__bracket">/&gt;</tspan>
          </text>
          <circle class="runtime-graph__port" cx="200" cy="250" r="4" />
        </g>
        <g class="runtime-graph__node runtime-graph__node--computed">
          <rect x="245" y="65" width="210" height="86" />
          <text x="350" y="108">
            <tspan class="runtime-graph__bracket">&lt;</tspan>
            <tspan>computed()</tspan>
            <tspan class="runtime-graph__bracket">/&gt;</tspan>
          </text>
          <circle class="runtime-graph__port" cx="245" cy="108" r="4" />
          <circle class="runtime-graph__port" cx="455" cy="108" r="4" />
        </g>
        <g class="runtime-graph__node runtime-graph__node--linked">
          <rect x="225" y="345" width="270" height="86" />
          <text x="360" y="388">
            <tspan class="runtime-graph__bracket">&lt;</tspan>
            <tspan>linkedSignal()</tspan>
            <tspan class="runtime-graph__bracket">/&gt;</tspan>
          </text>
          <circle class="runtime-graph__port" cx="225" cy="388" r="4" />
          <circle class="runtime-graph__port" cx="495" cy="388" r="4" />
        </g>
        <g class="runtime-graph__node runtime-graph__node--effect">
          <rect x="520" y="207" width="160" height="86" />
          <text x="600" y="250">
            <tspan class="runtime-graph__bracket">&lt;</tspan>
            <tspan>effect()</tspan>
            <tspan class="runtime-graph__bracket">/&gt;</tspan>
          </text>
          <circle class="runtime-graph__port" cx="520" cy="250" r="4" />
        </g>
      </svg>
    </div>
  `,
})
export class RuntimeGraphComponent {}
