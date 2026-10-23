import { soundEngine } from './audio/soundEngine.js';
import { PRESETS } from './audio/presets.js';
import { SceneManager } from './visual/sceneManager.js';
import { AudioVisualizer } from './visual/visualizer.js';
import { FocusTimer, BreathingGuide, SleepTimer } from './features/timer.js';
import { storage } from './features/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Scene & Canvas
  const sceneCanvas = document.getElementById('sceneCanvas');
  const sceneManager = new SceneManager(sceneCanvas);

  const visualizerCanvas = document.getElementById('visualizerCanvas');
  const audioVisualizer = new AudioVisualizer(visualizerCanvas, soundEngine);

  // 2. Mouse Glow Follower & Zen Bar Proximity
  const mouseGlow = document.getElementById('mouseGlow');
  const zenExitBar = document.getElementById('zenExitBar');

  window.addEventListener('mousemove', (e) => {
    if (mouseGlow) {
      mouseGlow.style.left = `${e.clientX}px`;
      mouseGlow.style.top = `${e.clientY}px`;
    }

    // Zen Mode exit bar reveal on mouse near top
    if (document.body.classList.contains('zen-active') && zenExitBar) {
      if (e.clientY < 90) {
        zenExitBar.classList.remove('opacity-0', 'pointer-events-none');
        zenExitBar.classList.add('opacity-100', 'pointer-events-auto');
      } else {
        zenExitBar.classList.remove('opacity-100', 'pointer-events-auto');
        zenExitBar.classList.add('opacity-0', 'pointer-events-none');
      }
    }
  });

  // 3. Render Presets (Built-in + Custom User Presets)
  const presetContainer = document.getElementById('presetContainer');

  function renderPresets() {
    if (!presetContainer) return;
    presetContainer.innerHTML = '';

    // Render Built-in Presets
    PRESETS.forEach((preset) => {
      const btn = document.createElement('button');
      btn.className = 'preset-pill';
      btn.dataset.presetId = preset.id;
      btn.innerHTML = `<i data-lucide="${preset.icon}" class="w-4 h-4"></i><span>${preset.name}</span>`;
      btn.addEventListener('click', () => applyPreset(preset));
      presetContainer.appendChild(btn);
    });

    // Render Saved Custom Mixes
    const customMixes = storage.getCustomMixes();
    if (customMixes.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'w-[1px] h-6 bg-white/10 mx-1 shrink-0';
      presetContainer.appendChild(divider);

      customMixes.forEach((mix) => {
        const btn = document.createElement('button');
        btn.className = 'preset-pill border-indigo-500/30 text-indigo-200';
        btn.dataset.presetId = mix.id;
        btn.innerHTML = `
          <i data-lucide="bookmark" class="w-4 h-4 text-indigo-400"></i>
          <span>${mix.name}</span>
          <span class="preset-delete-btn" title="Delete custom mix">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </span>
        `;

        // Click pill to apply
        btn.addEventListener('click', (e) => {
          if (e.target.closest('.preset-delete-btn')) return;
          applyPreset(mix);
        });

        // Click X to delete
        const delBtn = btn.querySelector('.preset-delete-btn');
        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete preset "${mix.name}"?`)) {
              storage.deleteMix(mix.id);
              renderPresets();
            }
          });
        }

        presetContainer.appendChild(btn);
      });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function applyPreset(preset) {
    document.querySelectorAll('.preset-pill').forEach((p) => p.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-preset-id="${preset.id}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Change background theme
    if (preset.theme) {
      sceneManager.setTheme(preset.theme);
      updateThemeButtons(preset.theme);
    }

    // Apply volumes smoothly
    Object.keys(preset.volumes).forEach((soundKey) => {
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
  document.querySelectorAll('input[data-sound]').forEach((slider) => {
    const soundKey = slider.dataset.sound;
    const valLabel = document.querySelector(`.val-${soundKey}`);

    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      soundEngine.setTrackVolume(soundKey, val);
      if (valLabel) valLabel.textContent = `${Math.round(val * 100)}%`;

      // Remove preset active state if customized
      document.querySelectorAll('.preset-pill').forEach((p) => p.classList.remove('active'));
    });
  });

  // 5. Master Play / Pause Controller
  const masterPlayBtn = document.getElementById('masterPlayBtn');
  const masterPlayIcon = document.getElementById('masterPlayIcon');
  const masterPlayText = document.getElementById('masterPlayText');

  function updateMasterPlayUI(isPlaying) {
    if (!masterPlayBtn) return;
    if (isPlaying) {
      masterPlayBtn.className =
        'flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 hover:brightness-110 active:scale-95 transition-all';
      if (masterPlayIcon) masterPlayIcon.setAttribute('data-lucide', 'pause');
      if (masterPlayText) masterPlayText.textContent = 'Playing';
    } else {
      masterPlayBtn.className =
        'flex items-center gap-2 px-3.5 py-2 rounded-xl glass-subtle text-amber-300 text-xs font-semibold border border-amber-500/30 hover:bg-amber-500/10 active:scale-95 transition-all';
      if (masterPlayIcon) masterPlayIcon.setAttribute('data-lucide', 'play');
      if (masterPlayText) masterPlayText.textContent = 'Paused';
    }
    if (window.lucide) window.lucide.createIcons();
  }

  if (masterPlayBtn) {
    masterPlayBtn.addEventListener('click', () => {
      const isPlaying = soundEngine.togglePlay();
      updateMasterPlayUI(isPlaying);
    });
  }

  // 6. Master Volume & Mute
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

  // 7. Theme Quick Switches
  const themeButtons = document.querySelectorAll('[data-theme-select]');
  function updateThemeButtons(currentTheme) {
    themeButtons.forEach((btn) => {
      if (btn.dataset.themeSelect === currentTheme) {
        btn.classList.add('bg-white/20', 'text-white');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('bg-white/20', 'text-white');
        btn.classList.add('text-slate-400');
      }
    });
  }

  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.themeSelect;
      sceneManager.setTheme(theme);
      updateThemeButtons(theme);
    });
  });

  // 8. Thunder / Lightning Trigger Button
  const lightningBtn = document.getElementById('lightningBtn');
  function triggerThunderEffect() {
    sceneManager.flashLightning();
    soundEngine.triggerThunder();
  }
  if (lightningBtn) {
    lightningBtn.addEventListener('click', triggerThunderEffect);
  }

  // 9. Zen Fullscreen Mode
  const zenModeBtn = document.getElementById('zenModeBtn');
  const exitZenBtn = document.getElementById('exitZenBtn');
  const zenIcon = document.getElementById('zenIcon');

  function toggleZenMode() {
    const isZen = document.body.classList.toggle('zen-active');

    if (isZen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      if (zenIcon) zenIcon.setAttribute('data-lucide', 'minimize-2');
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      if (zenIcon) zenIcon.setAttribute('data-lucide', 'maximize-2');
      if (zenExitBar) {
        zenExitBar.classList.remove('opacity-100', 'pointer-events-auto');
        zenExitBar.classList.add('opacity-0', 'pointer-events-none');
      }
    }
    if (window.lucide) window.lucide.createIcons();
  }

  if (zenModeBtn) zenModeBtn.addEventListener('click', toggleZenMode);
  if (exitZenBtn) exitZenBtn.addEventListener('click', toggleZenMode);

  // 10. Sleep Timer
  const sleepTimerBtn = document.getElementById('sleepTimerBtn');
  const sleepTimerMenu = document.getElementById('sleepTimerMenu');
  const sleepTimerLabel = document.getElementById('sleepTimerLabel');

  const sleepTimer = new SleepTimer(
    (formattedText, remainingSec) => {
      if (remainingSec > 0) {
        sleepTimerLabel.textContent = formattedText;
        sleepTimerBtn.classList.add('border-indigo-500/50', 'text-indigo-300');
      } else {
        sleepTimerLabel.textContent = 'Sleep Timer';
        sleepTimerBtn.classList.remove('border-indigo-500/50', 'text-indigo-300');
      }
    },
    () => {
      // On timer end: fade master and pause
      soundEngine.fadeMaster(0, 4);
      setTimeout(() => {
        soundEngine.pause();
        updateMasterPlayUI(false);
      }, 4000);
    }
  );

  if (sleepTimerBtn && sleepTimerMenu) {
    sleepTimerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sleepTimerMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.sleep-opt').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        const mins = parseInt(e.currentTarget.dataset.mins, 10);
        if (mins > 0) {
          sleepTimer.setTimer(mins);
        } else {
          sleepTimer.cancel();
        }
        sleepTimerMenu.classList.add('hidden');
      });
    });

    window.addEventListener('click', () => {
      sleepTimerMenu.classList.add('hidden');
    });
  }

  // 11. Focus Timer (Pomodoro)
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

  // 12. Zen Breathing Guide
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

  // 13. Save Custom Preset
  const saveMixBtn = document.getElementById('saveMixBtn');
  if (saveMixBtn) {
    saveMixBtn.addEventListener('click', () => {
      const name = prompt('Name your custom soundscape mix:', 'My Midnight Flow');
      if (name && name.trim()) {
        const volumes = {};
        document.querySelectorAll('input[data-sound]').forEach((s) => {
          volumes[s.dataset.sound] = parseFloat(s.value) / 100;
        });
        const saved = storage.saveMix(name.trim(), volumes, sceneManager.theme);
        renderPresets();
        if (saved) {
          applyPreset(saved);
        }
      }
    });
  }

  // 14. Keyboard Shortcuts Modal & Hotkeys
  const shortcutBtn = document.getElementById('shortcutBtn');
  const shortcutModal = document.getElementById('shortcutModal');
  const closeShortcutBtn = document.getElementById('closeShortcutBtn');

  function toggleShortcutModal(open = null) {
    if (!shortcutModal) return;
    const isCurrentlyActive = shortcutModal.classList.contains('active');
    const shouldOpen = open !== null ? open : !isCurrentlyActive;
    if (shouldOpen) {
      shortcutModal.classList.add('active');
    } else {
      shortcutModal.classList.remove('active');
    }
  }

  if (shortcutBtn) shortcutBtn.addEventListener('click', () => toggleShortcutModal(true));
  if (closeShortcutBtn) closeShortcutBtn.addEventListener('click', () => toggleShortcutModal(false));
  if (shortcutModal) {
    shortcutModal.addEventListener('click', (e) => {
      if (e.target === shortcutModal) toggleShortcutModal(false);
    });
  }

  window.addEventListener('keydown', (e) => {
    // Ignore hotkeys if typing in prompt or input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      const isPlaying = soundEngine.togglePlay();
      updateMasterPlayUI(isPlaying);
    } else if (e.key === 'm' || e.key === 'M') {
      const isMuted = soundEngine.toggleMute();
      muteBtn.classList.toggle('text-rose-400', isMuted);
      muteIcon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
      if (window.lucide) window.lucide.createIcons();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleZenMode();
    } else if (e.key === 't' || e.key === 'T') {
      triggerThunderEffect();
    } else if (['1', '2', '3', '4'].includes(e.key)) {
      const themeMap = { '1': 'rain', '2': 'fire', '3': 'cosmos', '4': 'ocean' };
      const selected = themeMap[e.key];
      if (selected) {
        sceneManager.setTheme(selected);
        updateThemeButtons(selected);
      }
    } else if (e.key === '?') {
      toggleShortcutModal();
    } else if (e.key === 'Escape') {
      toggleShortcutModal(false);
      if (document.body.classList.contains('zen-active')) {
        toggleZenMode();
      }
    }
  });

  // Initial setup
  renderPresets();
  applyPreset(PRESETS[0]);
  updateThemeButtons('rain');
  if (window.lucide) window.lucide.createIcons();
});
