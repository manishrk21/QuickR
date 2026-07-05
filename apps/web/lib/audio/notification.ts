let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || AudioContext)();
  }
  return audioCtx;
}

export function playNewOrderSound() {
  try {
    const ctx = getAudioCtx();

    const playTone = (
      freq: number,
      startTime: number,
      duration: number,
      gain: number
    ) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(523.25, now, 0.3, 0.3);
    playTone(659.25, now + 0.15, 0.4, 0.3);
  } catch {
    // Audio permission not granted or unsupported — fail silently.
  }
}

export function playHelpRequestSound() {
  try {
    const ctx = getAudioCtx();

    const playTone = (
      freq: number,
      startTime: number,
      duration: number,
      gain: number
    ) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(784, now, 0.18, 0.28);
    playTone(988, now + 0.12, 0.24, 0.28);
    playTone(784, now + 0.28, 0.18, 0.24);
  } catch {
    // Audio permission not granted or unsupported — fail silently.
  }
}
