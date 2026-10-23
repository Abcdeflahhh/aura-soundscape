/**
 * Pomodoro Focus Timer & Zen Breathing Rhythm Guide
 */

export class FocusTimer {
  constructor(onTick, onStateChange) {
    this.duration = 25 * 60; // 25 mins
    this.remaining = this.duration;
    this.isRunning = false;
    this.timerId = null;
    this.onTick = onTick;
    this.onStateChange = onStateChange;
    this.mode = 'pomodoro'; // pomodoro | break | zen
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.onStateChange(this.isRunning, this.mode);
    this.timerId = setInterval(() => {
      this.remaining--;
      if (this.remaining <= 0) {
        this.switchMode();
      }
      this.onTick(this.formatTime(), this.remaining / this.duration);
    }, 1000);
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerId);
    this.onStateChange(this.isRunning, this.mode);
  }

  reset(minutes = 25) {
    this.pause();
    this.duration = minutes * 60;
    this.remaining = this.duration;
    this.onTick(this.formatTime(), 1);
  }

  switchMode() {
    this.pause();
    if (this.mode === 'pomodoro') {
      this.mode = 'break';
      this.reset(5); // 5 min break
    } else {
      this.mode = 'pomodoro';
      this.reset(25);
    }
    this.start();
  }

  formatTime() {
    const mins = Math.floor(this.remaining / 60);
    const secs = this.remaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export class BreathingGuide {
  constructor(textElement, circleElement) {
    this.textEl = textElement;
    this.circleEl = circleElement;
    this.isRunning = false;
    this.phase = 0;
    this.intervalId = null;

    // 4-7-8 Rhythm (in seconds): Inhale 4s, Hold 7s, Exhale 8s
    this.phases = [
      { text: 'Inhale...', duration: 4000, scale: 1.35, color: '#38bdf8' },
      { text: 'Hold breath...', duration: 7000, scale: 1.35, color: '#818cf8' },
      { text: 'Exhale slowly...', duration: 8000, scale: 0.9, color: '#34d399' }
    ];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.step();
  }

  step() {
    if (!this.isRunning) return;
    const current = this.phases[this.phase];

    if (this.textEl) this.textEl.textContent = current.text;
    if (this.circleEl) {
      this.circleEl.style.transition = `transform ${current.duration}ms cubic-bezier(0.4, 0, 0.2, 1), border-color 1s ease`;
      this.circleEl.style.transform = `scale(${current.scale})`;
      this.circleEl.style.borderColor = current.color;
      this.circleEl.style.boxShadow = `0 0 35px ${current.color}40`;
    }

    this.intervalId = setTimeout(() => {
      this.phase = (this.phase + 1) % this.phases.length;
      this.step();
    }, current.duration);
  }

  stop() {
    this.isRunning = false;
    clearTimeout(this.intervalId);
    if (this.textEl) this.textEl.textContent = 'Breath Sync';
    if (this.circleEl) {
      this.circleEl.style.transform = 'scale(1)';
      this.circleEl.style.borderColor = 'rgba(255,255,255,0.2)';
      this.circleEl.style.boxShadow = 'none';
    }
    this.phase = 0;
  }

  toggle() {
    if (this.isRunning) this.stop();
    else this.start();
    return this.isRunning;
  }
}

export class SleepTimer {
  constructor(onTick, onEnd) {
    this.remainingSec = 0;
    this.timerId = null;
    this.onTick = onTick; // (formattedText, remainingSeconds)
    this.onEnd = onEnd; // ()
    this.isRunning = false;
  }

  setTimer(minutes) {
    this.cancel();
    if (!minutes || minutes <= 0) return;
    this.remainingSec = minutes * 60;
    this.isRunning = true;
    if (this.onTick) this.onTick(this.formatTime(), this.remainingSec);

    this.timerId = setInterval(() => {
      this.remainingSec--;
      if (this.remainingSec <= 0) {
        this.cancel();
        if (this.onEnd) this.onEnd();
      } else {
        if (this.onTick) this.onTick(this.formatTime(), this.remainingSec);
      }
    }, 1000);
  }

  cancel() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.remainingSec = 0;
    if (this.onTick) this.onTick('', 0);
  }

  formatTime() {
    const mins = Math.floor(this.remainingSec / 60);
    const secs = this.remainingSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
