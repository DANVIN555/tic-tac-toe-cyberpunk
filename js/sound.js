(function () {
  'use strict';

  var STORAGE_KEY = 'cttt-muted';
  var ctx = null;
  var masterGain = null;
  var muted = localStorage.getItem(STORAGE_KEY) === '1';

  function ensureContext() {
    if (ctx) return;
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
  }

  function resume() {
    ensureContext();
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, duration, type, delay, volume) {
    if (!ctx) return;
    type = type || 'sine';
    delay = delay || 0;
    volume = volume === undefined ? 0.2 : volume;

    var start = ctx.currentTime + delay;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain).connect(masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function sweep(freqFrom, freqTo, duration, type, volume) {
    if (!ctx) return;
    var start = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = type || 'sawtooth';
    osc.frequency.setValueAtTime(freqFrom, start);
    osc.frequency.exponentialRampToValueAtTime(freqTo, start + duration);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume || 0.18, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain).connect(masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playMoveSound(player) {
    resume();
    if (player === 'X') tone(880, 0.09, 'sine', 0, 0.18);
    else tone(660, 0.09, 'square', 0, 0.12);
  }

  function playHoverSound() {
    resume();
    tone(1200, 0.04, 'sine', 0, 0.06);
  }

  function playWinSound() {
    resume();
    var notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach(function (f, i) { tone(f, 0.22, 'sine', i * 0.1, 0.15); });
  }

  function playLoseSound() {
    resume();
    sweep(400, 90, 0.5, 'sawtooth', 0.16);
  }

  function playDrawSound() {
    resume();
    tone(440, 0.2, 'triangle', 0, 0.14);
    tone(330, 0.25, 'triangle', 0.08, 0.14);
  }

  function isMuted() {
    return muted;
  }

  function setMuted(value) {
    muted = value;
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    if (masterGain) masterGain.gain.value = muted ? 0 : 1;
  }

  function toggleMuted() {
    setMuted(!muted);
    return muted;
  }

  window.CTTT = window.CTTT || {};
  window.CTTT.Sound = {
    resume: resume,
    playMoveSound: playMoveSound,
    playHoverSound: playHoverSound,
    playWinSound: playWinSound,
    playLoseSound: playLoseSound,
    playDrawSound: playDrawSound,
    isMuted: isMuted,
    setMuted: setMuted,
    toggleMuted: toggleMuted
  };
})();
