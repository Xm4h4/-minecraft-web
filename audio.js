/**
 * Minecraft Web Edition - Web Audio Synthesizer
 * Generates procedural retro Minecraft sound effects:
 * footsteps, mining, block breaking, placing, level up chime, water splash,
 * and soothing C418-style ambient background piano chords.
 */

class MinecraftAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.initialized = false;
    this.musicTimer = null;
  }

  init() {
    if (this.initialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.initialized = true;
    this.startAmbientMusic();
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // =========================================================================
  // UI BUTTON CLICK & ADVANCEMENT FANFARE
  // =========================================================================
  playButtonClick() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playAdvancementChime() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    // Celebratory brass-like fanfare notes
    const melody = [
      { f: 523.25, t: 0.0, d: 0.12 }, // C5
      { f: 659.25, t: 0.12, d: 0.12 }, // E5
      { f: 783.99, t: 0.24, d: 0.12 }, // G5
      { f: 1046.50, t: 0.36, d: 0.35 } // C6
    ];

    melody.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + n.t;

      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + n.d);
    });
  }

  // =========================================================================
  // PLAYER HURT ("OOF!"), ITEM POP, EAT & WEAPON SWING
  // =========================================================================
  playHurt() {
    this.ensureContext();
    const now = this.ctx.currentTime;

    // The iconic retro Steve "OOF!" grunt
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.18);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.18);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playItemPop() {
    this.ensureContext();
    const now = this.ctx.currentTime;

    // High pitched bubbly "pop" for item collection
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playEat() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    // Crunching food sound
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.09;
      const buffer = this.createNoiseBuffer(0.06);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 400, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      src.start(t);
    }
  }

  playSwing() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.12;
    const buffer = this.createNoiseBuffer(dur);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
  }

  // =========================================================================
  // WILD ANIMALS: SHEEP, COW, PIG, CHICKEN
  // =========================================================================
  playSheepBaa() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.55;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(175, now);
    // Vibrato
    for (let i = 0; i < 6; i++) {
      osc.frequency.setValueAtTime(175 + ((i % 2 === 0) ? 12 : -12), now + i * 0.08);
    }
    osc.frequency.linearRampToValueAtTime(140, now + dur);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur);
  }

  playCowMoo() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.75;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(105, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.25);
    osc.frequency.linearRampToValueAtTime(80, now + dur);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur);
  }

  playPigOink() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.18;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(190, now + 0.08);
    osc.frequency.linearRampToValueAtTime(140, now + dur);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur);
  }

  playChickenCluck() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.12;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + dur);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur);
  }

  // =========================================================================
  // HOSTILE MOBS: ZOMBIE, CREEPER FUSE & EXPLOSION
  // =========================================================================
  playZombieGroan() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.4);
    osc.frequency.linearRampToValueAtTime(60, now + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  playBurn() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.22;
    const buffer = this.createNoiseBuffer(dur);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
  }

  playCreeperFuse() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 1.4;
    const buffer = this.createNoiseBuffer(dur);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2800, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.55, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
  }

  playExplosion() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.9;
    const buffer = this.createNoiseBuffer(dur);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);

    // Deep sub bass impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.5);
    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.5);
  }
  playFootstep(type = 'grass') {
    this.ensureContext();
    const now = this.ctx.currentTime;

    if (type === 'grass') {
      // Soft organic crunch
      const dur = 0.08;
      const buffer = this.createNoiseBuffer(dur);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + Math.random() * 200, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      src.start(now);

    } else if (type === 'stone') {
      // Crisp stone click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.06);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.06);

    } else if (type === 'wood') {
      // Warm hollow clop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160 + Math.random() * 30, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  }

  // =========================================================================
  // BLOCK PLACEMENT (Satisfying Pop)
  // =========================================================================
  playBlockPlace(soundType = 'stone') {
    this.ensureContext();
    const now = this.ctx.currentTime;

    const baseFreq = soundType === 'wood' ? 140 : (soundType === 'grass' ? 200 : 180);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * (0.9 + Math.random() * 0.2), now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);

    // Subtle click transient
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.03);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.2, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    noise.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  // =========================================================================
  // BLOCK MINING HIT & BREAKING
  // =========================================================================
  playMineHit(soundType = 'stone') {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.07;
    const buffer = this.createNoiseBuffer(dur);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = soundType === 'stone' ? 'bandpass' : 'lowpass';
    filter.frequency.setValueAtTime(soundType === 'stone' ? 1400 : 600, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
  }

  playBlockBreak(soundType = 'stone') {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.22;
    const buffer = this.createNoiseBuffer(dur);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(soundType === 'stone' ? 1800 : 900, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);

    // Deep destruction thump
    const osc = this.ctx.createOscillator();
    const oGain = this.ctx.createGain();
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);
    oGain.gain.setValueAtTime(0.4, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(oGain);
    oGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // =========================================================================
  // LEVEL UP / XP ORB CHIME
  // =========================================================================
  playLevelUpChime() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    // Major chord arpeggio: C6, E6, G6, C7
    const notes = [1046.50, 1318.51, 1567.98, 2093.00];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // =========================================================================
  // WATER SPLASH
  // =========================================================================
  playWaterSplash() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.35;
    const buffer = this.createNoiseBuffer(dur);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
  }

  playDoor(open = true) {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    if (open) {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
    } else {
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
    }

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playBedSleep() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    // Calming 3-note sleep lullaby chime (C4, E4, G4)
    [261.63, 329.63, 392.00].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.9);
    });
  }

  playCampfireSizzle() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const dur = 0.4;
    const buffer = this.createNoiseBuffer(dur);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
  }

  // =========================================================================
  // C418-STYLE CALMING AMBIENT BACKGROUND MUSIC
  // =========================================================================
  startAmbientMusic() {
    const playChordProgression = () => {
      if (!this.initialized || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Calming C418 chords: Fmaj7 -> G -> Em7 -> Am
      const chords = [
        [349.23, 440.00, 523.25, 659.25], // Fmaj7
        [392.00, 493.88, 587.33, 783.99], // G
        [329.63, 392.00, 493.88, 587.33], // Em7
        [440.00, 523.25, 659.25, 880.00]  // Am
      ];

      chords.forEach((chord, chordIdx) => {
        const chordTime = now + chordIdx * 3.8;
        chord.forEach((freq, noteIdx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = chordTime + noteIdx * 0.08; // Gentle strum

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          // Soft ambient piano envelope
          gain.gain.setValueAtTime(0.08, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 3.2);

          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(noteTime);
          osc.stop(noteTime + 3.2);
        });
      });

      // Schedule next progression in 24 seconds
      this.musicTimer = setTimeout(playChordProgression, 26000);
    };

    setTimeout(playChordProgression, 3000);
  }

  createNoiseBuffer(duration) {
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}

window.MinecraftAudioEngine = MinecraftAudioEngine;
window.mcAudio = new MinecraftAudioEngine();
