(function () {
  'use strict';

  var canvas = null;
  var ctx = null;
  var particles = [];
  var rafId = null;
  var running = false;
  var width = 0;
  var height = 0;

  var COLORS = ['rgba(252,238,10,', 'rgba(252,238,10,', 'rgba(255,46,46,', 'rgba(5,247,242,'];
  var PARTICLE_COUNT = 46;
  var LINK_DIST = 130;

  function makeParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 1.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
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
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '0.9)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color + '1)';
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var p1 = particles[a], p2 = particles[b];
        var dx = p1.x - p2.x, dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(252,238,10,' + (0.12 * (1 - dist / LINK_DIST)) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
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
