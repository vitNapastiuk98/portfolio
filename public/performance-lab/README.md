# Performance scheduling lab

This is an independently owned, synthetic experiment, not an employer case study or a benchmark of the portfolio application.

From the repository root, with Node 22 and Chrome installed:

```sh
node scripts/measure-performance.mjs
```

On systems where Chrome is installed elsewhere, set `CHROME_PATH` to the executable. The runner starts its own loopback server and temporary headless Chrome profile, then closes both. No new dependencies or external services are needed; fonts come from the repository’s installed dependencies. `public/performance-lab/results.json` is overwritten only after every run succeeds. The report records a SHA-256 hash of the fixture, checked by tests. After rerunning, update the quoted medians in src/app/data/web-performance.data.ts; tests check the prose against the report. Commit the fixture, study and report together when publishing new results.

The runner uses a 390 × 844 CSS-pixel mobile viewport, device scale factor 1, 4× CPU slowdown, disabled browser cache and no network throttling. It takes five fresh navigations per mode, pairs the runs, and alternates the first mode. There is no discarded warm-up. It waits 1.5 seconds, scrolls Save report into view, then performs one trusted mouse click and records after work completes plus 250 ms for observer delivery. Do not click or load the results table during measurement.

Baseline reveals the primary content after an artificial 800 ms delay without reserving space, then calculates a checksum over 30 million items in one task. Optimized reveals content immediately, reserves space and calculates the identical checksum in chunks of one million items, yielding through timers. The fixture uses the same Syne, Manrope and IBM Plex Mono fonts and visual palette as the portfolio. Fonts are served locally from the locked npm dependencies; run npm install first if they are missing. It remains an independent static page, without the Angular runtime or portfolio shell. Font loading is included in the observations. This compares scheduling strategies; it does not establish a production speedup or isolate the contribution of each individual change. Timer clamping and yielding can increase completion time.

LCP comes from the last Largest Contentful Paint entry before interaction. CLS is the maximum layout-shift session window (one-second gaps, five-second maximum), excluding shifts after recent input. Response-frame latency measures from the start of the click handler to the second requestAnimationFrame callback, crossing a frame boundary. It includes scheduling and frame overhead, excludes input delay, and is a presentation proxy rather than a paint timestamp. Event Timing durations are retained separately when the browser supplies them (16 ms reporting floor and rounding); absent entries remain null. Event Timing delivery can be sparse in headless runs; the report preserves missing samples without substituting the response-frame proxy. Neither value is **field INP**. Long tasks and total work-completion time are also retained in raw samples.

Medians summarize these five local runs; they are not field percentiles or confidence intervals. For real Core Web Vitals, collect representative real-user measurements and evaluate LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 at the 75th percentile, separately for mobile and desktop. Browser version, CPU, thermal state, background activity and viewport affect results. Repeat the experiment on your own hardware; exact numbers will vary.

Open `/performance-lab/?mode=baseline` or `/performance-lab/?mode=optimized` on the running portfolio to inspect the two modes manually. “Show recorded lab medians” loads the committed report on demand so its table cannot contaminate the automated run.

The page also provides a guided replay, live progress and feedback/completion observations, and side-by-side code for content arrival, reserved layout space and cooperative work. Replay is a manual demonstration, not a replacement for fresh-navigation measurements: layout shifts shortly after input can be excluded from CLS. The controlled run never presses replay or loads the recorded table.
