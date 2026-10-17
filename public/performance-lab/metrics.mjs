// Session windows: consecutive shifts <1 s apart, total duration <5 s.
export function accumulateLayoutShift(state, entry) {
  if (entry.hadRecentInput) return state;
  if (
    state.start === null ||
    entry.startTime - state.last >= 1000 ||
    entry.startTime - state.start >= 5000
  ) {
    state.start = entry.startTime;
    state.value = 0;
  }
  state.last = entry.startTime;
  state.value += entry.value;
  state.maximum = Math.max(state.maximum, state.value);
  return state;
}

export function observePerformance() {
  const metrics = (window.labMetrics = {
    lcpMs: null,
    lcpElement: null,
    lcpCandidates: [],
    cls: 0,
    layoutShifts: [],
    interactionMs: null,
    interactionId: null,
    eventTiming: [],
    trustedEvents: [],
    longTaskCount: 0,
    longTaskMs: 0,
    longTasks: [],
  });
  let interacting = false;
  for (const type of ['pointerdown', 'keydown']) {
    addEventListener(
      type,
      (event) => {
        if (event.isTrusted) {
          interacting = true;
          metrics.trustedEvents.push({
            name: type,
            startTime: event.timeStamp,
            target: event.target?.id || null,
          });
        }
      },
      { capture: true },
    );
  }
  const session = { start: null, last: null, value: 0, maximum: 0 };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const candidate = {
        startTime: entry.startTime,
        element: entry.element?.id || entry.element?.tagName || null,
        size: entry.size,
      };
      // Delayed observer delivery must not erase candidates created before input.
      if (!interacting || entry.startTime <= metrics.trustedEvents[0].startTime) {
        metrics.lcpCandidates.push(candidate);
        metrics.lcpMs = entry.startTime;
        metrics.lcpElement = candidate.element;
      }
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      accumulateLayoutShift(session, entry);
      metrics.cls = session.maximum;
      metrics.layoutShifts.push({
        startTime: entry.startTime,
        value: entry.value,
        hadRecentInput: entry.hadRecentInput,
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      metrics.longTaskCount++;
      metrics.longTaskMs += entry.duration;
      metrics.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
    }
  }).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.interactionId) continue;
      const click = metrics.trustedEvents.find(
        (event) =>
          event.target === 'run-work' && Math.abs(event.startTime - entry.startTime) < 1000,
      );
      const attributed = entry.target?.id === 'run-work' && Boolean(click);
      metrics.eventTiming.push({
        name: entry.name,
        startTime: entry.startTime,
        duration: entry.duration,
        interactionId: entry.interactionId,
        target: entry.target?.id || null,
        attributedToSave: attributed,
        inputDelay: entry.processingStart - entry.startTime,
        processingMs: entry.processingEnd - entry.processingStart,
      });
      if (
        attributed &&
        (metrics.interactionMs === null || entry.duration > metrics.interactionMs)
      ) {
        metrics.interactionMs = entry.duration;
        metrics.interactionId = entry.interactionId;
      }
    }
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
}
