import type { EngineeringStudy } from '../models/study.models';

export const webPerformance: EngineeringStudy = {
  slug: 'web-performance',
  title: 'Beyond Lighthouse: engineering real-world web performance',
  category: 'Frontend Engineering',
  experiment: true,
  summary:
    'A runnable scheduling experiment: diagnose delayed content, layout shifts and blocking work, then compare controlled measurements without confusing them with real-user outcomes.',
  lead: 'A fast initial render can still lead to a slow interaction. A good Lighthouse score can still hide a late layout shift. Performance engineering starts by identifying which user experience is failing, then choosing evidence that can actually test the proposed fix.',
  scopeNote:
    'Implemented lab study: an independently owned synthetic HTML fixture, runnable measurement script and recorded local samples. The fixture excludes Angular and the portfolio shell. These are not production results, field Core Web Vitals, employer benchmarks or accessibility-conformance claims.',
  sections: [
    {
      id: 'problem-and-constraints',
      label: 'Problem & constraints',
      title: 'Three symptoms need three different investigations',
      paragraphs: [
        'The example is a small order workspace with primary content and a Save report action. In the baseline, an artificial 800 ms gate delays the primary panel, its insertion moves existing content, and saving calculates a checksum in one synchronous task. The optimized mode reveals content immediately, reserves the panel’s space and yields between chunks of the identical calculation. This is a controlled demonstration of mechanisms, not a discovery that this portfolio had those production bottlenecks.',
        'LCP asks when the largest eligible content paints, not when every request finishes. Inspect the actual LCP element and split image loads into server response, resource discovery delay, download and render delay before choosing preload, compression or server work. INP asks how quickly interactions receive the next paint; split input delay, processing time and presentation delay. CLS asks how much unexpected movement accumulates in the largest shift session window. Inspect shift sources, reserve media dimensions and test content arriving after the initial load.',
      ],
      bullets: [
        'Field targets at the 75th percentile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Evaluate mobile and desktop separately; targets are not measured results.',
        'Five fresh navigations per mode, paired with alternating first mode; 390 × 844 viewport, 4× CPU slowdown, disabled cache and loopback networking.',
        'Keep the calculation and final checksum identical. Record time to feedback separately from time to finish all the work.',
      ],
    },
    {
      id: 'competing-solutions',
      label: 'Alternatives & implementation',
      title: 'Remove unnecessary work before scheduling the rest',
      paragraphs: [
        'The fixture compares a monolithic event handler with cooperative timer-based chunks. A short handler can paint “Saving…” while the remainder progresses, but yielding adds overhead and does not reduce total computation. A worker is a stronger choice for sustained CPU work when serialization, worker startup and cancellation are justified. Reducing the calculation itself would be better if the product could discard it. The static lab keeps the work identical so those different questions do not get confused.',
        'For an Angular application, first record an interaction trace and use Angular DevTools to locate expensive change detection and component work. Keep projections in computed signals, give list items stable identities, and apply OnPush at useful ownership boundaries. Move expensive non-UI computation outside rendering; memoize only when invalidation is clear. Lazy-load route code and defer genuinely noncritical sections with stable placeholders. Inspect the production bundle and network waterfall before splitting: extra chunks can create request waterfalls, and deferring the LCP content can make the experience worse. These Angular techniques are diagnostic guidance, not optimizations benchmarked by this standalone fixture.',
      ],
      bullets: [
        'The fixture uses text and the portfolio’s self-hosted fonts. Font loading is included in the lab observations; no image or font optimization is claimed.',
        'Use a browser trace to connect long tasks (>50 ms) to code, style, layout and paint. A long-task count alone does not identify the cause.',
        'Changes are bundled in two modes; this experiment does not isolate the causal contribution of each individual change. Toggle one change at a time for that follow-up.',
      ],
    },
    {
      id: 'measurement-and-evidence',
      label: 'Measurements & limits',
      title: 'A repeatable lab result is a starting point',
      paragraphs: [
        'Run node scripts/measure-performance.mjs from the repository root with Node 22 and Chrome installed; set CHROME_PATH when needed. The script starts its own local server and temporary browser profile, instruments PerformanceObserver before navigation, waits 1.5 seconds, scrolls Save report into view and clicks it and records all ten samples. It verifies the same checksum in both modes and writes public/performance-lab/results.json only after every sample succeeds. The lab and reproduction notes are linked above; the recorded medians can be loaded inside the lab without contaminating the automated measurement.',
        'The report retains browser version, hardware class, viewport, CPU setting, raw samples, LCP, session-window CLS, long tasks, work-completion time and a response-frame latency: click-handler start to the second requestAnimationFrame callback. This crosses a frame boundary, adds frame overhead and excludes input delay; it is a presentation proxy, not a paint timestamp. Event Timing entries are retained separately when available, with a 16 ms reporting floor; absent entries remain null. It is not field INP. Five local medians are not population percentiles, confidence intervals, Lighthouse scores or proof that the website meets Core Web Vitals. A faster first response may also accompany a longer total completion time; inspect both before choosing a scheduling strategy.',
      ],
      bullets: [
        'Recorded local medians (five runs per mode, Chrome 155 on Apple M3 Pro, 4× CPU slowdown): LCP 848 → 48 ms; CLS 0.087 → 0.000; response-frame proxy 188 → 57 ms. Full work completion moved in the other direction: 185 → 302 ms. The report retains all ten samples. These results demonstrate the synthetic workload’s scheduling and layout tradeoffs; the 800 ms content delay is deliberately injected, and the relative improvement must not be generalized to production.',
        'For a production release, collect LCP, INP and CLS through a maintained web-vitals implementation with appropriate privacy controls; segment by route, device and release.',
        'CrUX is a rolling 28-day field dataset when a page or origin has sufficient eligible traffic. Missing data means insufficient evidence, not a passing score.',
        'Re-run the same production build and conditions before and after a change, inspect distributions and regressions, then validate against representative real-user data.',
      ],
    },
  ],
  flow: {
    title: 'From symptom to defensible decision',
    steps: [
      {
        title: 'Define the failure',
        detail: 'Name the affected route, interaction, device and user-visible symptom.',
      },
      {
        title: 'Trace the cause',
        detail: 'Locate the LCP candidate, shift source or blocking task before choosing a fix.',
      },
      {
        title: 'Compare the change',
        detail:
          'Repeat the same workload and environment; retain every sample and completion time.',
      },
      {
        title: 'Validate in the field',
        detail:
          'Monitor representative users and release cohorts; keep lab and field conclusions separate.',
      },
    ],
  },
  decisions: [
    {
      title: 'Independent fixture',
      choice:
        'Use a small runnable HTML example and a Node/Chrome runner with no added dependencies.',
      tradeoff:
        'Mechanisms are inspectable, but the results do not benchmark Angular, network delivery or the portfolio shell.',
    },
    {
      title: 'Cooperative CPU work',
      choice: 'Yield between fixed-size chunks and expose progress before work completes.',
      tradeoff:
        'The main thread can paint, but timers add overhead. Sustained work may justify a worker or a different algorithm.',
    },
    {
      title: 'Honest evidence boundary',
      choice:
        'Retain raw paired samples and label the single-click measurement separately from field INP.',
      tradeoff:
        'This supports reproducing a local observation, not a production performance or Core Web Vitals claim.',
    },
  ],
  checks: [
    {
      scenario: 'Delayed content becomes the largest visible element.',
      expectation:
        'Inspect the actual LCP candidate: reducing a delay matters only if that content determines LCP.',
    },
    {
      scenario: 'The primary panel appears after the first paint.',
      expectation:
        'Baseline may move existing content; the optimized slot reserves space. Compute CLS using session windows and exclude recent-input shifts.',
    },
    {
      scenario: 'Save report performs the full calculation.',
      expectation:
        'Both modes produce the same checksum; record interaction delay and full completion time independently.',
    },
    {
      scenario: 'The browser provides no qualifying Event Timing entry.',
      expectation:
        'Retain null for Event Timing and label the separate response-frame proxy; never publish a fabricated zero or claim passing INP.',
    },
    {
      scenario: 'Local measurements improve, but real users still experience delays.',
      expectation:
        'Investigate device, network and release distributions; do not treat a lab median as a field percentile.',
    },
  ],
  takeaways: [
    'Choose the measurement that can falsify the hypothesis; a single audit score cannot explain every user experience.',
    'Reserve layout space, reveal useful content early and keep the main thread available, while checking total work and completion time.',
    'Publish the workload, environment, raw samples and limits alongside any reported improvement.',
  ],
  references: [
    { label: 'web.dev: Web Vitals and good thresholds', url: 'https://web.dev/articles/vitals' },
    {
      label: 'web.dev: Optimize Interaction to Next Paint',
      url: 'https://web.dev/articles/optimize-inp',
    },
    {
      label: 'Angular: runtime performance optimization',
      url: 'https://angular.dev/best-practices/runtime-performance',
    },
  ],
};
