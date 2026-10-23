/**
 * Aura Soundscape - Procedural Web Audio Engine
 * Generates ambient sounds algorithmically without external audio files.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.isMuted = false;
    this.isPlaying = true;
    this.previousMasterVolume = 0.8;
    this.sounds = {};
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Gain & Analyser
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.setupSounds();
    this.isInitialized = true;
  }

  ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate pink/brown/white noise buffers procedurally
  createNoiseBuffer(type = 'white', duration = 5) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'pink') {
        // Paul Kellet's filtered pink noise algorithm
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else if (type === 'brown') {
        // Brown noise
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      } else {
        // White noise
        output[i] = white * 0.5;
      }
    }
    return buffer;
  }

  setupSounds() {
    // 1. RAINFALL
    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const rainBuffer = this.createNoiseBuffer('pink', 4);
    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);
    rainSource.start();

    // 2. CAMPFIRE
    const fireGain = this.ctx.createGain();
    fireGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const fireBuffer = this.createNoiseBuffer('brown', 4);
    const fireSource = this.ctx.createBufferSource();
    fireSource.buffer = fireBuffer;
    fireSource.loop = true;

    const fireLowpass = this.ctx.createBiquadFilter();
    fireLowpass.type = 'lowpass';
    fireLowpass.frequency.setValueAtTime(400, this.ctx.currentTime);

    fireSource.connect(fireLowpass);
    fireLowpass.connect(fireGain);

    // Crackle generator for campfire pops
    setInterval(() => {
      if (fireGain.gain.value > 0.05 && this.ctx && this.ctx.state === 'running') {
        if (Math.random() > 0.35) {
          const crackleOsc = this.ctx.createOscillator();
          const crackleGain = this.ctx.createGain();
          const crackleFilter = this.ctx.createBiquadFilter();

          crackleFilter.type = 'bandpass';
          crackleFilter.frequency.setValueAtTime(1500 + Math.random() * 2500, this.ctx.currentTime);
          crackleFilter.Q.setValueAtTime(10, this.ctx.currentTime);

          crackleOsc.type = 'triangle';
          crackleOsc.frequency.setValueAtTime(120 + Math.random() * 200, this.ctx.currentTime);

          const now = this.ctx.currentTime;
          const popVolume = fireGain.gain.value * (0.15 + Math.random() * 0.25);
          crackleGain.gain.setValueAtTime(popVolume, now);
          crackleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04 + Math.random() * 0.06);

          crackleOsc.connect(crackleFilter);
          crackleFilter.connect(crackleGain);
          crackleGain.connect(this.masterGain);

          crackleOsc.start(now);
          crackleOsc.stop(now + 0.1);
        }
      }
    }, 120);

    fireGain.connect(this.masterGain);
    fireSource.start();

    // 3. OCEAN WAVES
    const oceanGain = this.ctx.createGain();
    oceanGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const oceanBuffer = this.createNoiseBuffer('pink', 6);
    const oceanSource = this.ctx.createBufferSource();
    oceanSource.buffer = oceanBuffer;
    oceanSource.loop = true;

    const oceanFilter = this.ctx.createBiquadFilter();
    oceanFilter.type = 'lowpass';
    oceanFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const oceanLFO = this.ctx.createOscillator();
    oceanLFO.type = 'sine';
    oceanLFO.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

    oceanLFO.connect(lfoGain);
    lfoGain.connect(oceanFilter.frequency);

    oceanSource.connect(oceanFilter);
    oceanFilter.connect(oceanGain);
    oceanGain.connect(this.masterGain);

    oceanLFO.start();
    oceanSource.start();

    // 4. BREEZE / WIND
    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const windBuffer = this.createNoiseBuffer('pink', 5);
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const windLFO = this.ctx.createOscillator();
    windLFO.type = 'sine';
    windLFO.frequency.setValueAtTime(0.08, this.ctx.currentTime);

    const windLFOGain = this.ctx.createGain();
    windLFOGain.gain.setValueAtTime(180, this.ctx.currentTime);

    windLFO.connect(windLFOGain);
    windLFOGain.connect(windFilter.frequency);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);

    windLFO.start();
    windSource.start();

    // 5. 432Hz COSMIC BINAURAL DRONE
    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(216, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(220, this.ctx.currentTime);

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(350, this.ctx.currentTime);

    oscLeft.connect(droneFilter);
    oscRight.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    // 6. NIGHT CRICKETS
    const cricketsGain = this.ctx.createGain();
    cricketsGain.gain.setValueAtTime(0, this.ctx.currentTime);

    setInterval(() => {
      if (cricketsGain.gain.value > 0.05 && this.ctx && this.ctx.state === 'running') {
        if (Math.random() > 0.4) {
          const chirpOsc = this.ctx.createOscillator();
          const chirpGain = this.ctx.createGain();

          chirpOsc.type = 'sine';
          chirpOsc.frequency.setValueAtTime(4500 + Math.random() * 400, this.ctx.currentTime);

          const now = this.ctx.currentTime;
          const chirpVol = cricketsGain.gain.value * 0.08;
          chirpGain.gain.setValueAtTime(0, now);
          chirpGain.gain.linearRampToValueAtTime(chirpVol, now + 0.03);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

          chirpOsc.connect(chirpGain);
          chirpGain.connect(this.masterGain);

          chirpOsc.start(now);
          chirpOsc.stop(now + 0.15);
        }
      }
    }, 180);

    this.sounds = {
      rain: { gain: rainGain, name: 'Rainfall', icon: 'cloud-rain', value: 0 },
      campfire: { gain: fireGain, name: 'Campfire', icon: 'flame', value: 0 },
      ocean: { gain: oceanGain, name: 'Ocean Waves', icon: 'waves', value: 0 },
      wind: { gain: windGain, name: 'Breeze', icon: 'wind', value: 0 },
      drone: { gain: droneGain, name: '432Hz Zen Drone', icon: 'sparkles', value: 0 },
      crickets: { gain: cricketsGain, name: 'Night Crickets', icon: 'moon', value: 0 }
    };
  }

  setTrackVolume(trackId, volume) {
    this.ensureContext();
    const track = this.sounds[trackId];
    if (track) {
      track.value = Math.max(0, Math.min(1, volume));
      const targetGain = this.isMuted ? 0 : track.value;
      track.gain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  setMasterVolume(volume) {
    this.ensureContext();
    const val = Math.max(0, Math.min(1, volume));
    this.previousMasterVolume = val;
    if (!this.isMuted) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0 : this.previousMasterVolume;
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    return this.isMuted;
  }

  togglePlay() {
    this.ensureContext();
    if (!this.ctx) return false;
    if (this.ctx.state === 'running') {
      this.ctx.suspend();
      this.isPlaying = false;
    } else {
      this.ctx.resume();
      this.isPlaying = true;
    }
    return this.isPlaying;
  }

  play() {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
  }

  pause() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
    this.isPlaying = false;
  }

  fadeMaster(targetValue, durationSec = 3) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(targetValue, now + durationSec);
  }

  triggerThunder() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    
    const rumbleOsc = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    const rumbleFilter = this.ctx.createBiquadFilter();

    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(140, now);

    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(80, now);
    rumbleOsc.frequency.exponentialRampToValueAtTime(30, now + 1.8);

    rumbleGain.gain.setValueAtTime(0.45 * (this.isMuted ? 0 : this.masterGain.gain.value), now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    rumbleOsc.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);

    rumbleOsc.start(now);
    rumbleOsc.stop(now + 2.5);
  }

  getAnalyserData() {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
}

export const soundEngine = new SoundEngine();
