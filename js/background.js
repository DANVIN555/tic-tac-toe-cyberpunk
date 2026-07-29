(function () {
  'use strict';

  var canvas = null;
  var ctx = null;
  var particles = [];
  var rafId = null;
  var running = false;
  var width = 0;
  var height = 0;

  var COLORS = ['rgba(255,157,0,', 'rgba(255,157,0,', 'rgba(138,255,0,', 'rgba(5,247,242,'];
  var MAX_SPEED = 0.55;
  var IS_LOW_POWER = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 640;
  var PARTICLE_COUNT = IS_LOW_POWER ? 16 : 46;
  var LINK_DIST = IS_LOW_POWER ? 0 : 130;
  var GLOW = !IS_LOW_POWER;

  function makeParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: IS_LOW_POWER ? (2.5 + Math.random() * 1.5) : (3 + Math.random() * 3),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }

  function drawAnt(p, angle) {
    var s = p.r;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);

    if (GLOW) {
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color + '1)';
    }

    ctx.strokeStyle = p.color + '0.85)';
    ctx.lineWidth = Math.max(0.6, s * 0.14);

    var legX = [-s * 0.6, 0, s * 0.55];
    for (var li = 0; li < legX.length; li++) {
      ctx.beginPath();
      ctx.moveTo(legX[li], 0);
      ctx.lineTo(legX[li] - s * 0.35, -s * 0.95);
      ctx.moveTo(legX[li], 0);
      ctx.lineTo(legX[li] - s * 0.35, s * 0.95);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(s * 1.25, -s * 0.15);
    ctx.lineTo(s * 1.9, -s * 0.6);
    ctx.moveTo(s * 1.25, s * 0.15);
    ctx.lineTo(s * 1.9, s * 0.6);
    ctx.stroke();

    ctx.fillStyle = p.color + '0.95)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.95, 0, s * 0.85, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.45, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.95, 0, s * 0.4, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function resize() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      p.vx += (Math.random() - 0.5) * 0.08;
      p.vy += (Math.random() - 0.5) * 0.08;
      var speed = Math.hypot(p.vx, p.vy);
      if (speed > MAX_SPEED) {
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      var angle = Math.atan2(p.vy, p.vx);
      drawAnt(p, angle);
    }

    ctx.shadowBlur = 0;

    if (GLOW) {
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var p1 = particles[a], p2 = particles[b];
          var dx = p1.x - p2.x, dy = p1.y - p2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(255,157,0,' + (0.12 * (1 - dist / LINK_DIST)) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    if (running) rafId = requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  function init() {
    canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(makeParticle());

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  window.CTTT = window.CTTT || {};
  window.CTTT.Background = {
    init: init
  };
})();
