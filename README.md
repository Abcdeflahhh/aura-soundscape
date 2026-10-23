# 🎧 Aura Soundscape — Interactive Ambient Sound & Visualizer

> A high-craft ambient audio synthesizer and dynamic canvas visualizer designed for focus, relaxation, and creative vibe coding. Built at the intersection of **Design Engineering** and **Creative Development**.

![Aura Soundscape Preview](https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop)

---

## ✨ Features

- 🎹 **100% Procedural Web Audio API Engine:**
  - Zero external MP3 files, zero loading latency, and zero broken assets.
  - Algorithms synthesize realistic **Rainfall (Pink noise + Lowpass)**, **Campfire (Brown noise + stochastic crackle pops)**, **Ocean Swells (LFO modulated sweep)**, **Wind Breeze**, and **432Hz Binaural Zen Drones**.
- 🎨 **Dynamic HTML5 Canvas Particle Visualizer:**
  - **Midnight Rain:** Slanted precipitation streaks with water ripples and lightning flash events.
  - **Cozy Campfire:** Floating embers with realistic buoyancy, turbulence, and heat glow.
  - **Cosmic Zen:** 3D warp starfield projection.
  - **Coastal Ocean:** Multi-layered soothing harmonic sine waves.
- 📊 **Real-Time Audio Spectrum Analyser:** Live frequency waveform reacting to the blended audio mix via `AudioContext.createAnalyser()`.
- ⏱️ **Integrated Focus & Mindfulness Toolkit:**
  - **Pomodoro Timer:** 25-minute deep work / 5-minute break cycles.
  - **Zen 4-7-8 Breathing Guide:** Expanding holographic rhythm circle (Inhale, Hold, Exhale).
  - **Sleep Timer:** Auto fade-out & stop after 15, 30, 45, or 60 minutes.
- 💾 **Custom Mix Presets & Storage:** Curated soundscapes ("Midnight Rain", "Cozy Cabin", "Cosmic Zen", etc.) with full custom mix management (save, load, and delete your personal soundscapes in `localStorage`).
- 🖥️ **Zen Fullscreen Mode:** Distraction-free ambient immersion with auto-revealing controls.
- ⌨️ **Intuitive Keyboard Hotkeys:** `Space` (Play/Pause), `M` (Mute), `F` (Zen Mode), `T` (Thunder), `1-4` (Themes), `?` (Shortcuts Guide).
- 🪄 **Modern Design Engineering UI:**
  - Frosted glassmorphism (`backdrop-blur-20px`).
  - Interactive cursor radial light glow.
  - Custom glowing range sliders and micro-interactions.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Audio Engine** | HTML5 Web Audio API, BiquadFilterNode, GainNode, AnalyserNode, Procedural Noise Buffers |
| **Graphics & Visuals** | HTML5 Canvas 2D Particle Engine, High-DPI Resizing, RequestAnimationFrame |
| **Styling & Design** | Tailwind CSS, Plus Jakarta Sans, Custom Glassmorphism, Responsive CSS Grid |
| **Icons & UI** | Lucide Icons |
| **Architecture** | Native Vanilla ES6+ Modules (Zero bloat, blazing fast) |

---

## 🚀 How to Run

### Method 1: Instant Browser Launch (Zero Installation)
Simply double-click [`index.html`](file:///C:/Users/aflah/OneDrive/Documents/AntiGravity%20Project/aura-soundscape/index.html) or right-click and choose **Open with Browser** (Chrome / Edge / Firefox / Brave).

### Method 2: Modern Dev Server (Vite)
If you prefer running with a hot-reloading dev server:
```bash
cd "C:\Users\aflah\OneDrive\Documents\AntiGravity Project\aura-soundscape"
npm install
npm run dev
```

---

## 🧠 Technical Highlights & Engineering Decisions

1. **Why Procedural Audio instead of MP3 files?**
   - Traditional ambient websites load 50MB+ of looped audio files which can buffer, stutter, or fail due to CORS.
   - By calculating mathematical white/pink/brown noise formulas and sculpting them with dynamic biquad filters and LFOs, the entire application weighs less than **100KB** and runs offline seamlessly.
2. **Audio Analyser Performance:**
   - The visualizer connects to a single unified master AnalyserNode with `fftSize = 256` and `smoothingTimeConstant = 0.8`, providing a fluid 60fps render loop with negligible CPU footprint.

---

Crafted with passion for creative coding, audio exploration, and design aesthetics.
