import { Component, input } from '@angular/core';
import type { StudyContent } from '../models/study.models';

@Component({
  selector: 'app-study-body',
  host: { class: 'study-body' },
  template: `
    <aside class="study-nav">
      <nav aria-label="Study contents">
        <p class="eyebrow">Inside the study</p>
        @for (section of study().sections; track section.id; let index = $index) {
          <a [attr.href]="path() + '#' + section.id">
            <span>{{ (index + 1).toString().padStart(2, '0') }}</span
            >{{ section.label }}
          </a>
        }
        @if (study().flow) {
          <a [attr.href]="path() + '#flow'"><span>↳</span>System flow</a>
        }
        @if (study().decisions) {
          <a [attr.href]="path() + '#decisions'"><span>↳</span>Decisions & tradeoffs</a>
        }
        @if (study().checks) {
          <a [attr.href]="path() + '#validation'"><span>↳</span>Failure cases & validation</a>
        }
        @if (study().takeaways) {
          <a [attr.href]="path() + '#takeaways'"><span>↳</span>Engineering lessons</a>
        }
        <a [attr.href]="path() + '#references'"><span>↳</span>Technical references</a>
      </nav>
    </aside>

    <div class="study-content">
      <div class="study-opening">
        <p class="study-lead">{{ study().lead }}</p>
        <p class="study-scope-note">{{ study().scopeNote }}</p>
      </div>
      @for (section of study().sections; track section.id; let index = $index) {
        <section class="study-section" [attr.aria-labelledby]="section.id">
          <p class="eyebrow">{{ (index + 1).toString().padStart(2, '0') }} / {{ section.label }}</p>
          <h2 [id]="section.id">{{ section.title }}</h2>
          @for (paragraph of section.paragraphs; track paragraph) {
            <p>{{ paragraph }}</p>
          }
          @if (section.bullets; as bullets) {
            <ul class="study-points">
              @for (bullet of bullets; track bullet) {
                <li>{{ bullet }}</li>
              }
            </ul>
          }
        </section>
      }

      @if (study().flow; as flow) {
        <section class="study-section" aria-labelledby="flow">
          <p class="eyebrow">System flow</p>
          <h2 id="flow">{{ flow.title }}</h2>
          <ol class="study-flow">
            @for (step of flow.steps; track step.title; let index = $index) {
              <li>
                <span class="eyebrow">{{ (index + 1).toString().padStart(2, '0') }}</span>
                <h3>{{ step.title }}</h3>
                <p>{{ step.detail }}</p>
              </li>
            }
          </ol>
        </section>
      }

      @if (study().decisions; as decisions) {
        <section class="study-section" aria-labelledby="decisions">
          <p class="eyebrow">Decision record</p>
          <h2 id="decisions">Design decisions and tradeoffs</h2>
          <p class="study-table-hint">↔ Scroll horizontally to compare approaches and tradeoffs.</p>
          <div
            class="study-table-wrap"
            tabindex="0"
            role="region"
            aria-label="Engineering decisions and tradeoffs"
          >
            <table class="study-decisions">
              <caption>
                Approaches and their tradeoffs
              </caption>
              <thead>
                <tr>
                  <th scope="col">Decision</th>
                  <th scope="col">Approach</th>
                  <th scope="col">Tradeoff</th>
                </tr>
              </thead>
              <tbody>
                @for (decision of decisions; track decision.title) {
                  <tr>
                    <th scope="row">{{ decision.title }}</th>
                    <td>{{ decision.choice }}</td>
                    <td>{{ decision.tradeoff }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      @if (study().checks; as checks) {
        <section class="study-section" aria-labelledby="validation">
          <p class="eyebrow">Failure cases & validation</p>
          <h2 id="validation">Failure scenarios to validate</h2>
          <p>
            Proposed validation scenarios and expected behavior. These are design checks, not
            reported production test results.
          </p>
          <ol class="study-checks">
            @for (check of checks; track check.scenario) {
              <li>
                <h3>{{ check.scenario }}</h3>
                <p>{{ check.expectation }}</p>
              </li>
            }
          </ol>
        </section>
      }

      @if (study().takeaways; as takeaways) {
        <section class="study-section" aria-labelledby="takeaways">
          <p class="eyebrow">Reflection</p>
          <h2 id="takeaways">Engineering lessons</h2>
          <ul class="study-takeaways">
            @for (takeaway of takeaways; track takeaway; let index = $index) {
              <li>
                <span>{{ (index + 1).toString().padStart(2, '0') }}</span>
                <p>{{ takeaway }}</p>
              </li>
            }
          </ul>
        </section>
      }

      <section class="study-section" aria-labelledby="references">
        <p class="eyebrow">Evidence & further reading</p>
        <h2 id="references">Technical references</h2>
        <ul class="study-references">
          @for (reference of study().references; track reference.url) {
            <li>
              <a [href]="reference.url" target="_blank" rel="noreferrer"
                >{{ reference.label }} <span aria-hidden="true">↗</span></a
              >
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class StudyBodyComponent {
  readonly study = input.required<StudyContent>();
  readonly path = input.required<string>();
}
