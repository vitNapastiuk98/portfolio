import { Component } from '@angular/core';

@Component({
  selector: 'app-anchor-tracking-diagram',
  host: { class: 'anchor-tracking-diagram' },
  template: `
    <figure>
      <figcaption>
        <p class="eyebrow">The visual model</p>
        <h2>Annotation geometry vs. tracking region</h2>
        <p>
          The solid shape is the original annotation. The dashed region provides more texture for
          tracking; it does not enlarge the annotation.
        </p>
      </figcaption>
      <div class="anchor-diagram-frames">
        @for (frame of frames; track frame.title; let index = $index) {
          <div>
            <p class="eyebrow">{{ frame.title }}</p>
            <svg viewBox="0 0 400 260" role="img" [attr.aria-labelledby]="'anchor-frame-' + index">
              <title [id]="'anchor-frame-' + index">{{ frame.description }}</title>
              <rect
                x="1"
                y="1"
                width="398"
                height="258"
                rx="2"
                fill="none"
                stroke="currentColor"
                opacity="0.25"
              />
              <g [attr.transform]="frame.transform">
                <path d="M70 35H310V230H70Z" fill="currentColor" opacity="0.04" />
                <path
                  d="M70 95H310M70 160H310M130 35V230M245 35V230"
                  stroke="currentColor"
                  opacity="0.15"
                />
                <rect x="110" y="70" width="150" height="130" class="anchor-context" />
                <g fill="currentColor">
                  <circle cx="125" cy="87" r="3" />
                  <circle cx="158" cy="96" r="3" />
                  <circle cx="231" cy="86" r="3" />
                  <circle cx="246" cy="125" r="3" />
                  <circle cx="132" cy="169" r="3" />
                  <circle cx="170" cy="181" r="3" />
                  <circle cx="219" cy="164" r="3" />
                  <circle cx="235" cy="189" r="3" />
                </g>
                <rect x="172" y="128" width="24" height="18" class="anchor-mark" />
              </g>
            </svg>
            <p>{{ frame.caption }}</p>
          </div>
        }
      </div>
      <div class="anchor-diagram-legend">
        <span><i class="anchor-mark-key"></i>Annotation geometry</span
        ><span><i class="anchor-context-key"></i>Expanded tracking context</span
        ><span>• Illustrative feature locations</span>
      </div>
      <p class="anchor-diagram-note">
        Illustrative planar motion, not captured footage or measured tracking output. A valid
        transform moves the original mark; insufficient confidence hides it.
      </p>
      <ol class="anchor-media-path" aria-label="Conceptual Kurento media path">
        <li><span>Media source</span><strong>Incoming WebRTC</strong></li>
        <li><span>Frame processing</span><strong>OpenCV-based Kurento media filter</strong></li>
        <li><span>Filtered stream</span><strong>Outgoing WebRTC</strong></li>
      </ol>
    </figure>
    <figure class="matching-example">
      <figcaption>
        <p class="eyebrow">Geometric validation</p>
        <h2>Accepted and rejected correspondence patterns</h2>
      </figcaption>
      <div class="anchor-diagram-frames">
        @for (example of matchingExamples; track example.title; let index = $index) {
          <div>
            <h3>{{ example.title }}</h3>
            <div class="matching-labels"><span>Reference</span><span>Current frame</span></div>
            <svg
              viewBox="0 0 400 180"
              role="img"
              [attr.aria-labelledby]="'matching-example-' + index"
            >
              <title [id]="'matching-example-' + index">{{ example.description }}</title>
              <rect
                x="20"
                y="20"
                width="120"
                height="145"
                fill="none"
                stroke="currentColor"
                opacity="0.15"
              />
              <rect
                x="235"
                y="20"
                width="120"
                height="145"
                fill="none"
                stroke="currentColor"
                opacity="0.15"
              />
              <path d="M40 40H120V140H40Z" fill="none" stroke="currentColor" opacity="0.4" />
              @if (example.accepted) {
                <path
                  d="M267 52.8L339 62.4L329 157.4L257 147.8Z"
                  fill="none"
                  stroke="currentColor"
                  opacity="0.6"
                />
              }
              @for (pair of example.pairs; track $index) {
                <line
                  [attr.x1]="pair[0]"
                  [attr.y1]="pair[1]"
                  [attr.x2]="pair[2]"
                  [attr.y2]="pair[3]"
                  class="matching-line"
                  [class.matching-line--rejected]="!example.accepted"
                />
                <circle [attr.cx]="pair[0]" [attr.cy]="pair[1]" r="3" fill="currentColor" />
                <circle [attr.cx]="pair[2]" [attr.cy]="pair[3]" r="3" fill="currentColor" />
              }
            </svg>
            <p>{{ example.caption }}</p>
          </div>
        }
      </div>
      <p class="anchor-diagram-note">
        Schematic examples, not tracker output. An accepted geometric model may still follow
        background features; surface selection needs a separate check.
      </p>
    </figure>
  `,
  styles: `
    :host {
      display: block;
      grid-column: 1/-1;
      min-width: 0;
      margin-top: 3rem;
    }
    figure {
      margin: 0;
      padding: clamp(1.2rem, 3vw, 2.5rem);
      border: 1px solid var(--rule);
    }
    .matching-example {
      margin-top: 2rem;
    }
    h3 {
      margin: 0 0 1rem;
      color: var(--paper);
      font-size: 1rem;
      line-height: 1.4;
      letter-spacing: -0.02em;
    }
    .matching-labels {
      display: flex;
      justify-content: space-between;
      padding-right: 12%;
      color: var(--muted);
      font: 0.6rem/1.6 var(--mono);
    }
    .matching-line {
      stroke: var(--cyan);
      stroke-width: 1;
      opacity: 0.6;
    }
    .matching-line--rejected {
      stroke: var(--orange);
      stroke-dasharray: 3 4;
    }
    h2 {
      max-width: 26ch;
      margin: 1rem 0;
      font-size: clamp(1.5rem, 2.5vw, 2.5rem);
      line-height: 1.15;
    }
    p {
      max-width: 78ch;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.75;
    }
    .anchor-diagram-frames {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    svg {
      display: block;
      width: 100%;
      color: var(--paper);
    }
    .anchor-context {
      fill: none;
      stroke: var(--cyan);
      stroke-width: 1.5;
      stroke-dasharray: 6 5;
    }
    .anchor-mark {
      fill: none;
      stroke: var(--orange);
      stroke-width: 3;
    }
    .anchor-diagram-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 2rem;
      padding-block: 1rem;
      border-block: 1px solid var(--rule);
      color: var(--muted);
      font: 0.65rem/1.6 var(--mono);
    }
    .anchor-diagram-legend span {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
    }
    .anchor-diagram-legend i {
      width: 1rem;
      height: 0.65rem;
    }
    .anchor-mark-key {
      border: 2px solid var(--orange);
    }
    .anchor-context-key {
      border: 1px dashed var(--cyan);
    }
    .anchor-diagram-note {
      font-size: 0.8rem;
    }
    .anchor-media-path {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin: 2rem 0 0;
      padding: 0;
      list-style: none;
    }
    .anchor-media-path li {
      display: grid;
      gap: 0.6rem;
      padding: 1rem;
      border: 1px solid var(--rule);
    }
    .anchor-media-path span {
      color: var(--orange);
      font: 0.6rem/1.6 var(--mono);
      text-transform: uppercase;
    }
    .anchor-media-path strong {
      color: var(--paper);
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.5;
    }
    @media (max-width: 650px) {
      .anchor-diagram-frames,
      .anchor-media-path {
        grid-template-columns: 1fr;
      }
      .anchor-diagram-frames {
        gap: 1rem;
      }
    }
  `,
})
export class AnchorTrackingDiagramComponent {
  readonly matchingExamples = [
    {
      title: 'Geometric checks pass',
      accepted: true,
      description:
        'Illustrative feature correspondences consistent with one affine transformation, a special case of a homography',
      caption: 'The supporting points fit a consistent transformation.',
      pairs: [
        [50, 50, 275, 63.5],
        [110, 50, 329, 70.7],
        [50, 120, 268, 130],
        [110, 120, 322, 137.2],
        [80, 70, 300, 86.1],
        [80, 100, 297, 114.6],
      ],
    },
    {
      title: 'Candidate rejected',
      accepted: false,
      description:
        'Illustrative inconsistent feature correspondences that fail the assumed geometric acceptance criteria',
      caption:
        'The proposed correspondences provide insufficient agreement for the assumed acceptance criteria.',
      pairs: [
        [50, 50, 275, 45],
        [110, 50, 328, 140],
        [50, 120, 270, 135],
        [110, 120, 330, 52],
        [80, 70, 290, 150],
        [80, 100, 335, 95],
      ],
    },
  ] as const;
  readonly frames = [
    {
      title: '01 / Reference selection',
      description:
        'A small annotation inside a larger dashed tracking region on an illustrative textured surface',
      transform: 'translate(0 0)',
      caption:
        'Input: shape type and points. Select tracking context around the original annotation.',
    },
    {
      title: '02 / Current frame',
      description:
        'The same surface has moved and rotated; the annotation follows it without adopting the expanded tracking area',
      transform: 'translate(38 -8) rotate(10 190 130)',
      caption:
        'Output: project the original geometry only when matching and geometric checks support the attachment.',
    },
  ] as const;
}
