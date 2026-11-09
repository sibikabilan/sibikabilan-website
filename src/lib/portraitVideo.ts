/**
 * The talking portrait's clip, as one element for the whole visit.
 *
 * Phones, iOS above all, only let a video play with sound once that same
 * element has been started from a tap. The portrait sits far down the page,
 * so the tap that matters (Enter with sound, on the opening screen) happens
 * long before the portrait exists. Keeping one element alive lets that tap
 * win it permission to speak; the portrait then adopts it (see CodePortrait).
 */

const SRC = "/media/sibi-talk.mp4";
let clip: HTMLVideoElement | null = null;

export function portraitVideo(): HTMLVideoElement {
  if (clip) return clip;
  const v = document.createElement("video");
  v.muted = true;
  v.defaultMuted = true;
  v.playsInline = true;
  v.setAttribute("playsinline", "");
  v.setAttribute("muted", "");
  v.setAttribute("aria-hidden", "true");
  v.preload = "auto";
  // Barely visible rather than hidden: some browsers stop decoding hidden video.
  v.className = "pointer-events-none absolute inset-0 h-full w-full object-contain opacity-[0.01]";
  v.src = SRC;
  clip = v;
  return v;
}

/**
 * Call inside a tap or click. Starts the clip with sound for an instant and
 * stops it again (the first words come 0.7s in, so nothing is heard). After
 * this the portrait may play its line out loud when the visitor reaches it.
 */
export function unlockPortraitVoice() {
  const v = portraitVideo();
  v.muted = false;
  const quiet = () => {
    v.pause();
    v.currentTime = 0;
    v.muted = true;
  };
  const started = v.play();
  if (started) started.then(quiet).catch(() => (v.muted = true));
  else quiet();
}
