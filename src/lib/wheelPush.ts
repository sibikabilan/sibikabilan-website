/**
 * Tells a new push on a wheel or trackpad from the rest of the input it
 * makes. Trackpads keep sending a fading tail of events for a second or more
 * after the fingers lift, sometimes after a short silence; a push is only a
 * new one when the input rises again after it had died down, or (for a
 * wheel's separate notches) arrives after a pause. Timing comes from the
 * events' own timestamps, so a busy page that delivers them late, in
 * bunches, doesn't read as pauses.
 *
 * Used by the pinned sections on desktop (useStepScroll) and by the paged
 * home page on touch screens, where a trackpad or mouse pages it the same
 * way a swipe does (touchSteps).
 */

/** Input this far apart starts a new gesture. */
export const GESTURE_GAP_MS = 200;
/** A wheel event after a pause this long is a fresh push (a mouse wheel notch, a new flick). */
const PUSH_GAP_MS = 60;
/** Events closer together than this are one continuous stream: a trackpad, not wheel notches. */
const STREAM_MS = 34;
/**
 * A trackpad can go quiet between the fingers lifting and the momentum taking over. Input
 * that picks up again within this long, no stronger than before, is that same push.
 */
const RESUME_MS = 450;
/** Pushes closer together than this count as one, so a fast flick of a wheel can't skip ahead. */
const MIN_PUSH_MS = 140;

const average = (xs: number[], n: number) => {
  const tail = xs.slice(-n);
  return tail.reduce((a, b) => a + b, 0) / Math.max(1, tail.length);
};

export interface WheelInput {
  /** The event's time, in ms. */
  now: number;
  /** How strong it was. */
  mag: number;
  /** It begins a new gesture (the last one had ended). */
  gesture: boolean;
}

export function createPushDetector() {
  let history: number[] = [];
  let lastAt = 0;
  let lastInterval = Infinity;
  let lastMag = 0;
  let lastPushAt = 0;
  // The strongest and weakest input since the last accepted push.
  let peak = 0;
  let trough = Infinity;
  // About the latest event, for `isPush`.
  let gap = Infinity;
  let streaming = false;
  let resumed = false;

  return {
    /** Feed every wheel event through this first. */
    read(event: WheelEvent, deltaY: number): WheelInput {
      const now = event.timeStamp || performance.now();
      gap = now - lastAt;
      const mag = Math.abs(deltaY);
      // Was the input a continuous stream just before this event (a trackpad)?
      streaming = lastInterval < STREAM_MS;
      resumed = streaming && gap < RESUME_MS && mag <= lastMag * 1.25 + 1;
      const gesture = gap > GESTURE_GAP_MS && !resumed;
      if (gesture) {
        history = [];
        peak = 0;
        trough = Infinity;
      }
      lastInterval = gap;
      lastAt = now;
      lastMag = mag;
      history.push(mag);
      if (history.length > 70) history.shift();
      return { now, mag, gesture };
    },
    /** Whether the event just read starts a new push. */
    isPush({ now, mag }: WheelInput): boolean {
      // The trough only counts the fall after the peak: a push still building up isn't a dip.
      if (mag > peak) {
        peak = mag;
        trough = mag;
      } else trough = Math.min(trough, mag);
      // A pause starts a new push after separate notches, or once a stream has truly stopped;
      // inside a stream (and across the momentum's silence) only a rise again does.
      const paused = gap > PUSH_GAP_MS && (!streaming || (gap > GESTURE_GAP_MS && !resumed));
      const fresh = paused || (trough < peak * 0.45 && average(history, 3) > trough * 2 + 4);
      return fresh && now - lastPushAt >= MIN_PUSH_MS;
    },
    /** Call when a push has been acted on: what follows it is its momentum, until input rises again. */
    accept({ now, mag }: WheelInput) {
      lastPushAt = now;
      peak = mag;
      trough = Infinity;
    },
  };
}
