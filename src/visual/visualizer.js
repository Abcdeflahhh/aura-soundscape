/**
 * Audio Reactive Visualizer Canvas
 * Renders live frequency data into circular spectrum waves and bars
 */

export class AudioVisualizer {
  constructor(canvas, soundEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.soundEngine = soundEngine;
    this.isActive = true;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.render = this.render.bind(this);
    this.render();
  }

  resize() {
    this.width = this.canvas.parentElement.clientWidth || 300;
    this.height = this.canvas.parentElement.clientHeight || 120;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  render() {
    requestAnimationFrame(this.render);
    if (!this.isActive) return;

    const data = this.soundEngine.getAnalyserData();
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (!data || data.length === 0) {
      this.drawIdleWave();
      return;
    }

    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    if (sum === 0) {
      this.drawIdleWave();
      return;
    }

    const barCount = 32;
    const barWidth = (this.width / barCount) - 3;
    const step = Math.floor(data.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const val = data[i * step] || 0;
      const percent = val / 255;
      const barHeight = Math.max(4, percent * (this.height - 10));
      const x = i * (barWidth + 3);
      const y = this.height - barHeight;

      const grad = this.ctx.createLinearGradient(0, y, 0, this.height);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.5, '#818cf8');
      grad.addColorStop(1, '#c084fc');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      this.ctx.fill();
    }
  }

  drawIdleWave() {
    const time = Date.now() * 0.003;
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    this.ctx.lineWidth = 2;

    for (let x = 0; x < this.width; x += 4) {
      const y = this.height / 2 + Math.sin(x * 0.05 + time) * 3;
      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
  }
}
