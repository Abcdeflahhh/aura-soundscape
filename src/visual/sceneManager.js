/**
 * Canvas Scene Manager - Renders interactive background particle effects
 */

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.theme = 'rain'; // rain | fire | cosmos | ocean
    this.particles = [];
    this.ripples = [];
    this.stars = [];
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, isDown: false };
    this.animationFrameId = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('click', (e) => this.onClick(e));

    this.initTheme(this.theme);
    this.animate = this.animate.bind(this);
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.initTheme(this.theme);
  }

  onMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  onClick(e) {
    if (this.theme === 'rain') {
      this.ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 2,
        maxRadius: 45 + Math.random() * 25,
        opacity: 0.8
      });
    }
  }

  setTheme(theme) {
    this.theme = theme;
    this.particles = [];
    this.ripples = [];
    this.stars = [];
    this.initTheme(theme);
  }

  initTheme(theme) {
    if (theme === 'rain') {
      const dropCount = Math.floor(this.width * 0.18);
      this.particles = [];
      for (let i = 0; i < dropCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          length: 12 + Math.random() * 18,
          speed: 14 + Math.random() * 12,
          opacity: 0.2 + Math.random() * 0.5,
          thickness: 1 + Math.random() * 1.5
        });
      }
    } else if (theme === 'fire') {
      const emberCount = 120;
      this.particles = [];
      for (let i = 0; i < emberCount; i++) {
        this.particles.push(this.createEmber());
      }
    } else if (theme === 'cosmos') {
      const starCount = 200;
      this.stars = [];
      for (let i = 0; i < starCount; i++) {
        this.stars.push({
          x: (Math.random() - 0.5) * this.width * 2,
          y: (Math.random() - 0.5) * this.height * 2,
          z: Math.random() * this.width,
          size: 1 + Math.random() * 2
        });
      }
    } else if (theme === 'ocean') {
      this.waveOffset = 0;
    }
  }

  createEmber() {
    return {
      x: Math.random() * this.width,
      y: this.height + Math.random() * 50,
      radius: 1 + Math.random() * 3,
      speedY: 1.2 + Math.random() * 2.8,
      speedX: (Math.random() - 0.5) * 1.5,
      opacity: 0.3 + Math.random() * 0.7,
      decay: 0.003 + Math.random() * 0.005,
      hue: 20 + Math.random() * 35
    };
  }

  drawRain() {
    this.ctx.fillStyle = 'rgba(7, 10, 19, 0.45)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = '#60a5fa';
    this.ctx.lineCap = 'round';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.beginPath();
      this.ctx.lineWidth = p.thickness;
      this.ctx.strokeStyle = `rgba(147, 197, 253, ${p.opacity})`;
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x - 2, p.y + p.length);
      this.ctx.stroke();

      p.y += p.speed;
      p.x -= 1.5;

      if (p.y > this.height) {
        p.y = -20;
        p.x = Math.random() * (this.width + 100);

        if (Math.random() > 0.85) {
          this.ripples.push({
            x: p.x,
            y: this.height - 10 + Math.random() * 10,
            radius: 1,
            maxRadius: 10 + Math.random() * 12,
            opacity: 0.4
          });
        }
      }
    }

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      this.ctx.beginPath();
      this.ctx.strokeStyle = `rgba(191, 219, 254, ${r.opacity})`;
      this.ctx.lineWidth = 1;
      this.ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.4, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      r.radius += 0.8;
      r.opacity -= 0.015;

      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
  }

  drawFire() {
    const bgGrad = this.ctx.createRadialGradient(
      this.width / 2, this.height, 50,
      this.width / 2, this.height * 0.6, this.width
    );
    bgGrad.addColorStop(0, 'rgba(40, 16, 8, 0.4)');
    bgGrad.addColorStop(1, 'rgba(10, 5, 5, 0.45)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.opacity})`;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
      this.ctx.fill();

      p.y -= p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.02) * 0.8;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y < -20) {
        this.particles[i] = this.createEmber();
      }
    }
    this.ctx.shadowBlur = 0;
  }

  drawCosmos() {
    this.ctx.fillStyle = 'rgba(5, 5, 12, 0.4)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.z -= 0.8;
      if (star.z <= 0) {
        star.z = this.width;
        star.x = (Math.random() - 0.5) * this.width * 2;
        star.y = (Math.random() - 0.5) * this.height * 2;
      }

      const k = 250 / star.z;
      const px = star.x * k + cx;
      const py = star.y * k + cy;

      if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
        const size = (1 - star.z / this.width) * 2.5;
        const alpha = (1 - star.z / this.width) * 0.9;
        this.ctx.beginPath();
        this.ctx.arc(px, py, size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(224, 231, 255, ${alpha})`;
        this.ctx.fill();
      }
    }
  }

  drawOcean() {
    this.ctx.fillStyle = 'rgba(6, 15, 25, 0.4)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (!this.waveOffset) this.waveOffset = 0;
    this.waveOffset += 0.015;

    const layers = [
      { y: this.height * 0.65, amp: 25, freq: 0.003, color: 'rgba(14, 116, 144, 0.25)' },
      { y: this.height * 0.75, amp: 35, freq: 0.004, color: 'rgba(6, 182, 212, 0.3)' },
      { y: this.height * 0.85, amp: 45, freq: 0.005, color: 'rgba(56, 189, 248, 0.4)' }
    ];

    layers.forEach((layer, idx) => {
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.height);
      for (let x = 0; x <= this.width; x += 10) {
        const y = layer.y + Math.sin(x * layer.freq + this.waveOffset + idx) * layer.amp;
        this.ctx.lineTo(x, y);
      }
      this.ctx.lineTo(this.width, this.height);
      this.ctx.closePath();
      this.ctx.fillStyle = layer.color;
      this.ctx.fill();
    });
  }

  animate() {
    if (this.theme === 'rain') {
      this.drawRain();
    } else if (this.theme === 'fire') {
      this.drawFire();
    } else if (this.theme === 'cosmos') {
      this.drawCosmos();
    } else if (this.theme === 'ocean') {
      this.drawOcean();
    }
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  flashLightning() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
