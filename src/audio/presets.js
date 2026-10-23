/**
 * Preset ambient sound mixes
 */

export const PRESETS = [
  {
    id: 'midnight-rain',
    name: 'Midnight Rain',
    icon: 'cloud-rain',
    description: 'Heavy rain tapping on window panes in a quiet night.',
    theme: 'rain',
    volumes: {
      rain: 0.85,
      wind: 0.35,
      campfire: 0,
      ocean: 0,
      drone: 0.15,
      crickets: 0
    }
  },
  {
    id: 'cozy-cabin',
    name: 'Cozy Cabin',
    icon: 'flame',
    description: 'Warm crackling fireplace with gentle rain outside.',
    theme: 'fire',
    volumes: {
      rain: 0.4,
      campfire: 0.8,
      wind: 0.2,
      ocean: 0,
      drone: 0,
      crickets: 0
    }
  },
  {
    id: 'deep-zen',
    name: 'Cosmic 432Hz Zen',
    icon: 'sparkles',
    description: 'Calming binaural drone tuned for deep thinking and coding.',
    theme: 'cosmos',
    volumes: {
      rain: 0,
      campfire: 0,
      ocean: 0.45,
      wind: 0.15,
      drone: 0.85,
      crickets: 0
    }
  },
  {
    id: 'forest-night',
    name: 'Forest Campfire',
    icon: 'moon',
    description: 'Tranquil evening crickets and gentle embers under the stars.',
    theme: 'fire',
    volumes: {
      rain: 0,
      campfire: 0.65,
      wind: 0.3,
      ocean: 0,
      drone: 0,
      crickets: 0.75
    }
  },
  {
    id: 'ocean-waves',
    name: 'Coastal Solitude',
    icon: 'waves',
    description: 'Rhythmic ocean swells and coastal breeze.',
    theme: 'ocean',
    volumes: {
      rain: 0,
      campfire: 0,
      ocean: 0.85,
      wind: 0.4,
      drone: 0.2,
      crickets: 0
    }
  }
];
