# Performance scheduling lab

Independently owned synthetic experiment, not an employer case study or a benchmark of the Angular portfolio shell.

From the repository root, with Node 22, installed dependencies and Chrome:

```sh
node scripts/measure-performance.mjs
```

Set `CHROME_PATH` if Chrome is installed elsewhere. The runner uses a temporary profile and loopback server and closes both. Fonts come from installed npm packages. `results.json` is replaced atomically only after all samples succeed. Format the fixture and instrumentation **before** running: tests check their exact SHA-256 hashes. Update quoted study medians and the results table after rerunning; commit fixture, report and study together.

Five conditions use identical 30-million-item checksum work:

| Condition        | Content gate | Reserved slot | CPU work        |
| ---------------- | ------------ | ------------- | --------------- |
| baseline         | 800 ms       | No            | Blocking        |
| optimized        | None         | Yes           | Yielding chunks |
| delay-only       | None         | No            | Blocking        |
| reservation-only | 800 ms       | Yes           | Blocking        |
| scheduling-only  | 800 ms       | No            | Yielding chunks |

The three “only” conditions change one baseline factor. Five blocks each visit all five conditions, reversing order on alternate blocks. All 25 raw samples are retained, including slow samples; there is no discarded warm-up. Medians, min/max, mean and sample standard deviation describe this run. Five repetitions do not justify population percentiles or confidence intervals.

Environment: 390 × 844 CSS pixels, device scale factor 1, mobile emulation, 4× CPU slowdown, disabled cache, loopback network with no network throttling. Font loading remains included. After 1.5 seconds the runner scrolls Save report into view and sends a trusted CDP click, then waits for work completion plus 250 ms observer delivery. Do not run builds or other CPU-heavy checks during collection. Hardware, thermals and background activity remain uncontrolled limits.

LCP retains visible candidates created before the first trusted interaction. **Content readiness is separate:** reserving a slot can push delayed content outside the viewport and make a heading become LCP, even while the 800 ms gate remains. Inspect `lcpCandidates`, `lcpElement` and `contentReadyMs` together. CLS is the largest eligible shift session: gaps strictly less than one second, duration strictly less than five seconds from the first shift; recent-input shifts are excluded. Raw shifts are retained.

`responseFrameMs` is handler start to the second requestAnimationFrame callback. It includes a frame boundary, excludes input delay and is neither a paint timestamp nor INP. Event Timing retains raw entries and attributes a duration only when the target is Save report and a trusted Save pointerdown is nearby. Missing entries remain **null**, not zero. `fieldINP` remains null. Long tasks and total completion time remain available: yielding can improve early feedback while making full completion slower.

Open `/performance-lab/?mode=baseline` and try all five controls. Replay, progress feedback and the three code walkthroughs remain available. Replay shortly after input may produce shifts excluded from CLS; automated runs never press replay or load the recorded table. Assets use root-absolute paths so Firebase slash removal does not break fonts or reports.

The Angular study separately embeds `app-angular-performance-lab`: 300 identical rows are replaced five times while tracking objects or stable IDs. It reports actual reused DOM nodes and elapsed ranges. This local diagnostic does not benchmark production Core Web Vitals or prove Signals/OnPush performance.

The original unchanged two-mode rerun is preserved at `docs/engineering-studies/performance-baseline-results.json`. Additional controls change geometry; compare causal variations within the final report, not its CLS against the old fixture.

References: [LCP](https://web.dev/articles/lcp), [CLS](https://web.dev/articles/cls), [INP optimization](https://web.dev/articles/optimize-inp), [Web Vitals](https://web.dev/articles/vitals), [Angular tracking](https://angular.dev/guide/templates/control-flow).
