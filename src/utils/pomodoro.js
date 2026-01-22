export const pad = (value) => String(value).padStart(2, '0');

export const formatTime = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const formatDuration = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
};

export const getBreakWindow = (now) => {
  const minute = now.getMinutes();
  const start = new Date(now);
  const end = new Date(now);

  if (minute >= 55) {
    start.setMinutes(55, 0, 0);
    end.setHours(now.getHours() + 1, 0, 0, 0);
    return { start, end };
  }

  start.setMinutes(25, 0, 0);
  end.setMinutes(30, 0, 0);
  return { start, end };
};

export const getSegmentInfo = (now) => {
  const minute = now.getMinutes();
  const start = new Date(now);
  const end = new Date(now);

  if (minute >= 55) {
    start.setMinutes(55, 0, 0);
    end.setHours(now.getHours() + 1, 0, 0, 0);
    return { mode: 'break', start, end };
  }

  if (minute >= 25 && minute < 30) {
    start.setMinutes(25, 0, 0);
    end.setMinutes(30, 0, 0);
    return { mode: 'break', start, end };
  }

  if (minute < 25) {
    start.setMinutes(0, 0, 0);
    end.setMinutes(25, 0, 0);
    return { mode: 'focus', start, end };
  }

  start.setMinutes(30, 0, 0);
  end.setMinutes(55, 0, 0);
  return { mode: 'focus', start, end };
};

export const getNextBreakStart = (now) => {
  const minute = now.getMinutes();
  const next = new Date(now);

  if (minute < 25) {
    next.setMinutes(25, 0, 0);
    return next;
  }

  if (minute < 55) {
    next.setMinutes(55, 0, 0);
    return next;
  }

  next.setHours(now.getHours() + 1, 25, 0, 0);
  return next;
};

export const playBell = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
    oscillator.onended = () => context.close();
  } catch (error) {
  }
};
