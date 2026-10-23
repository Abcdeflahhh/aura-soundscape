import { soundEngine } from './audio/soundEngine.js';
import { PRESETS } from './audio/presets.js';
import { SceneManager } from './visual/sceneManager.js';
import { AudioVisualizer } from './visual/visualizer.js';
import { FocusTimer, BreathingGuide } from './features/timer.js';
import { storage } from './features/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Scene & Canvas
  const sceneCanvas = document.getElementById('sceneCanvas');
  const sceneManager = new SceneManager(sceneCanvas);

  const visualizerCanvas = document.getElementById('visualizerCanvas');
  const audioVisualizer = new AudioVisualizer(visualizerCanvas, soundEngine);

  // 2. Mouse Glow Follower
  const mouseGlow = document.getElementById('mouseGlow');
  window.addEventListener('mousemove', (e) => {
    if (mouseGlow) {
      mouseGlow.style.left = `${e.clientX}px`;
      mouseGlow.style.top = `${e.clientY}px`;
    }
  });

  // 3. Render Presets Pills
  const presetContainer = document.getElementById('presetContainer');
  function renderPresets() {
    presetContainer.innerHTML = '';
    PRESETS.forEach((preset, index) => {
      const btn = document.createElement('button');
      btn.className = `preset-pill ${index === 0 ? 'active' : ''}`;
      btn.dataset.presetId = preset.id;
      btn.innerHTML = `<i data-lucide="${preset.icon}" class="w-4 h-4"></i><span>${preset.name}</span>`;
      btn.addEventListener('click', () => applyPreset(preset));
      presetContainer.appendChild(btn);
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function applyPreset(preset) {
    document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-preset-id="${preset.id}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Change background theme
    if (preset.theme) {
      sceneManager.setTheme(preset.theme);
      updateThemeButtons(preset.theme);
    }

    // Apply volumes smoothly
    Object.keys(preset.volumes).forEach(soundKey => {
      const vol = preset.volumes[soundKey];
      soundEngine.setTrackVolume(soundKey, vol);

      // Update Slider UI
      const slider = document.querySelector(`input[data-sound="${soundKey}"]`);
      const valLabel = document.querySelector(`.val-${soundKey}`);
      if (slider) slider.value = vol * 100;
      if (valLabel) valLabel.textContent = `${Math.round(vol * 100)}%`;
    });
  }

  // 4. Sound Sliders Binding
  document.querySelectorAll('input[data-sound]').forEach(slider => {
    const soundKey = slider.dataset.sound;
    const valLabel = document.querySelector(`.val-${soundKey}`);

    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      soundEngine.setTrackVolume(soundKey, val);
      if (valLabel) valLabel.textContent = `${Math.round(val * 100)}%`;

      // Remove preset active state if customized
      document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
    });
  });

  // 5. Master Volume & Mute
  const masterSlider = document.getElementById('masterVolume');
  const muteBtn = document.getElementById('muteBtn');
  const muteIcon = document.getElementById('muteIcon');

  if (masterSlider) {
    masterSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      soundEngine.setMasterVolume(val);
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      muteBtn.classList.toggle('text-rose-400', isMuted);
      muteIcon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // 6. Theme Quick Switches
  const themeButtons = document.querySelectorAll('[data-theme-select]');
  function updateThemeButtons(currentTheme) {
    themeButtons.forEach(btn => {
      if (btn.dataset.themeSelect === currentTheme) {
        btn.classList.add('bg-white/20', 'text-white');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('bg-white/20', 'text-white');
        btn.classList.add('text-slate-400');
      }
    });
  }

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.themeSelect;
      sceneManager.setTheme(theme);
      updateThemeButtons(theme);
    });
  });

  // 7. Thunder / Lightning Trigger Button
  const lightningBtn = document.getElementById('lightningBtn');
  if (lightningBtn) {
    lightningBtn.addEventListener('click', () => {
      sceneManager.flashLightning();
      soundEngine.triggerThunder();
    });
  }

  // 8. Focus Timer (Pomodoro)
  const timerDisplay = document.getElementById('timerDisplay');
  const timerToggleBtn = document.getElementById('timerToggleBtn');
  const timerResetBtn = document.getElementById('timerResetBtn');
  const timerModeLabel = document.getElementById('timerModeLabel');

  const focusTimer = new FocusTimer(
    (timeFormatted) => {
      if (timerDisplay) timerDisplay.textContent = timeFormatted;
    },
    (isRunning, mode) => {
      if (timerToggleBtn) {
        timerToggleBtn.innerHTML = isRunning 
          ? '<i data-lucide="pause" class="w-4 h-4"></i><span>Pause</span>'
          : '<i data-lucide="play" class="w-4 h-4"></i><span>Focus</span>';
        if (window.lucide) window.lucide.createIcons();
      }
      if (timerModeLabel) {
        timerModeLabel.textContent = mode === 'pomodoro' ? 'Deep Work' : 'Rest Break';
      }
    }
  );

  if (timerToggleBtn) {
    timerToggleBtn.addEventListener('click', () => {
      soundEngine.ensureContext();
      if (focusTimer.isRunning) focusTimer.pause();
      else focusTimer.start();
    });
  }

  if (timerResetBtn) {
    timerResetBtn.addEventListener('click', () => focusTimer.reset(25));
  }

  // 9. Zen Breathing Guide
  const breathText = document.getElementById('breathText');
  const breathCircle = document.getElementById('breathCircle');
  const breathToggleBtn = document.getElementById('breathToggleBtn');
  const breathingGuide = new BreathingGuide(breathText, breathCircle);

  if (breathToggleBtn) {
    breathToggleBtn.addEventListener('click', () => {
      const isRunning = breathingGuide.toggle();
      breathToggleBtn.classList.toggle('bg-sky-500/20', isRunning);
      breathToggleBtn.classList.toggle('border-sky-500/40', isRunning);
    });
  }

  // 10. Save Custom Preset
  const saveMixBtn = document.getElementById('saveMixBtn');
  if (saveMixBtn) {
    saveMixBtn.addEventListener('click', () => {
      const name = prompt('Name your custom soundscape mix:', 'My Midnight Flow');
      if (name && name.trim()) {
        const volumes = {};
        document.querySelectorAll('input[data-sound]').forEach(s => {
          volumes[s.dataset.sound] = parseFloat(s.value) / 100;
        });
        storage.saveMix(name.trim(), volumes, sceneManager.theme);
        alert(`Saved "${name.trim()}" to your local favorites!`);
      }
    });
  }

  // Initial setup
  renderPresets();
  applyPreset(PRESETS[0]);
  updateThemeButtons('rain');
  if (window.lucide) window.lucide.createIcons();
});
