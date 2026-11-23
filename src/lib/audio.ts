/**
 * Short Web Audio chimes. No audio files, no network. The context is created
 * lazily and resumed inside a user gesture, which browsers require.
 */

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;
  const Constructor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Constructor) return null;
  context = new Constructor();
  return context;
}

/** Call from a click or key handler before the first sound. */
export function unlockAudio(): void {
  const audio = getContext();
  if (audio?.state === "suspended") void audio.resume();
}

export function playChime(
  options: { frequency?: number; durationMs?: number; volume?: number } = {},
): void {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();

  const { frequency = 880, durationMs = 220, volume = 0.12 } = options;
  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000 + 0.02);
  oscillator.addEventListener("ended", () => {
    oscillator.disconnect();
    gain.disconnect();
  });
}

export function playFinishChime(): void {
  playChime({ frequency: 660, durationMs: 180 });
  setTimeout(() => playChime({ frequency: 990, durationMs: 260 }), 190);
}
