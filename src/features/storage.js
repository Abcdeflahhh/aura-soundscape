/**
 * LocalStorage manager for custom user sound mixes
 */

const STORAGE_KEY = 'aura_soundscape_custom_mixes';

export const storage = {
  getCustomMixes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Storage read failed', e);
      return [];
    }
  },

  saveMix(name, volumes, theme = 'rain') {
    try {
      const mixes = this.getCustomMixes();
      const newMix = {
        id: `custom-${Date.now()}`,
        name,
        volumes,
        theme,
        createdAt: new Date().toISOString()
      };
      mixes.push(newMix);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes));
      return newMix;
    } catch (e) {
      console.error('Failed to save mix', e);
      return null;
    }
  },

  deleteMix(id) {
    try {
      let mixes = this.getCustomMixes();
      mixes = mixes.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes));
      return true;
    } catch (e) {
      return false;
    }
  }
};
