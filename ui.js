(function () {
  'use strict';

  var dom = {};
  var glitchTimer = null;

  function cacheDom() {
    dom.screens = document.querySelectorAll('.screen');
    dom.screenMenu = document.getElementById('screen-menu');
    dom.screenGame = document.getElementById('screen-game');
    dom.screenResult = document.getElementById('screen-result');

    dom.btnModePvp = document.getElementById('btn-mode-pvp');
    dom.btnModeAi = document.getElementById('btn-mode-ai');
    dom.aiOptions = document.getElementById('ai-options');
    dom.btnSymbolX = document.getElementById('btn-symbol-x');
    dom.btnSymbolO = document.getElementById('btn-symbol-o');
    dom.btnStartAi = document.getElementById('btn-start-ai');

    dom.board = document.getElementById('board');
    dom.cells = document.querySelectorAll('.cell');
    dom.winLineSvg = document.getElementById('win-line-svg');
    dom.winLine = document.getElementById('win-line');

    dom.hudPlayerX = document.getElementById('hud-player-x');
    dom.hudPlayerO = document.getElementById('hud-player-o');
    dom.scoreX = document.getElementById('score-x');
    dom.scoreO = document.getElementById('score-o');
    dom.scoreDraw = document.getElementById('score-draw');

    dom.btnRestart = document.getElementById('btn-restart');
    dom.btnMenu = document.getElementById('btn-menu');

    dom.resultTitle = document.getElementById('result-title');
    dom.btnPlayAgain = document.getElementById('btn-play-again');
    dom.btnResultMenu = document.getElementById('btn-result-menu');

    dom.muteBtn = document.getElementById('mute-btn');

    dom.glitchEls = document.querySelectorAll('.glitch');
  }

  function showScreen(name) {
    dom.screens.forEach(function (s) { s.classList.remove('screen--active'); });
    if (name === 'menu') dom.screenMenu.classList.add('screen--active');
    if (name === 'game') dom.screenGame.classList.add('screen--active');
  }

  function markSvgX() {
    return '<svg viewBox="0 0 100 100" class="mark-x">' +
      '<line class="mark-draw" x1="15" y1="15" x2="85" y2="85" style="--len:99"/>' +
      '<line class="mark-draw" x1="85" y1="15" x2="15" y2="85" style="--len:99" />' +
      '</svg>';
  }

  function markSvgO() {
    return '<svg viewBox="0 0 100 100" class="mark-o">' +
      '<circle class="mark-draw" cx="50" cy="50" r="35" fill="none" style="--len:220" />' +
      '</svg>';
  }

  function renderMark(index, player) {
    var cell = dom.cells[index];
    cell.innerHTML = player === 'X' ? markSvgX() : markSvgO();
    cell.classList.add(player === 'X' ? 'filled-x' : 'filled-o');
    cell.disabled = true;
  }

  function clearBoard() {
    dom.cells.forEach(function (cell) {
      cell.innerHTML = '';
      cell.disabled = false;
      cell.classList.remove('filled-x', 'filled-o', 'win-cell');
    });
    dom.winLine.classList.remove('show');
    dom.winLine.removeAttribute('style');
  }

  function setCellsEnabled(enabled) {
    dom.cells.forEach(function (cell) {
      if (!cell.classList.contains('filled-x') && !cell.classList.contains('filled-o')) {
        cell.disabled = !enabled;
      }
    });
  }

  function updateTurnIndicator(currentPlayer) {
    dom.hudPlayerX.classList.toggle('active', currentPlayer === 'X');
    dom.hudPlayerO.classList.toggle('active', currentPlayer === 'O');
  }

  function updateScores(scores) {
    dom.scoreX.textContent = scores.X;
    dom.scoreO.textContent = scores.O;
    dom.scoreDraw.textContent = scores.draw;
  }

  function highlightWinningLine(line) {
    line.forEach(function (idx) {
      dom.cells[idx].classList.add('win-cell');
    });

    var boardRect = dom.board.getBoundingClientRect();
    var r1 = dom.cells[line[0]].getBoundingClientRect();
    var r2 = dom.cells[line[2]].getBoundingClientRect();

    var x1 = r1.left + r1.width / 2 - boardRect.left;
    var y1 = r1.top + r1.height / 2 - boardRect.top;
    var x2 = r2.left + r2.width / 2 - boardRect.left;
    var y2 = r2.top + r2.height / 2 - boardRect.top;

    var length = Math.hypot(x2 - x1, y2 - y1);

    dom.winLine.setAttribute('x1', x1);
    dom.winLine.setAttribute('y1', y1);
    dom.winLine.setAttribute('x2', x2);
    dom.winLine.setAttribute('y2', y2);
    dom.winLine.style.setProperty('--len', length);
    dom.winLine.style.strokeDasharray = length;
    dom.winLine.style.strokeDashoffset = length;
    dom.winLine.classList.add('show');
  }

  function showResult(outcome, mode, humanSymbol) {
    var title = dom.resultTitle;
    title.classList.remove('state-win', 'state-lose', 'state-draw', 'state-o');

    var text, cls;
    if (outcome === 'draw') {
      text = 'DRAW';
      cls = 'state-draw';
    } else if (mode === 'ai') {
      if (outcome === humanSymbol) {
        text = 'YOU WIN';
        cls = 'state-win';
      } else {
        text = 'YOU LOSE';
        cls = 'state-lose';
      }
    } else {
      text = outcome + ' WINS';
      cls = outcome === 'X' ? 'state-win' : 'state-o';
    }

    title.textContent = text;
    title.setAttribute('data-text', text);
    title.classList.add(cls);
    dom.screenResult.classList.add('visible');
  }

  function hideResult() {
    dom.screenResult.classList.remove('visible');
  }

  function setMuteIcon(muted) {
    dom.muteBtn.classList.toggle('muted', muted);
  }

  function scheduleGlitchBursts() {
    if (glitchTimer) clearInterval(glitchTimer);
    glitchTimer = setInterval(function () {
      var visible = Array.prototype.filter.call(dom.glitchEls, function (el) {
        return el.offsetParent !== null;
      });
      if (!visible.length) return;
      var el = visible[Math.floor(Math.random() * visible.length)];
      el.classList.add('glitch-burst');
      setTimeout(function () { el.classList.remove('glitch-burst'); }, 150);
    }, 1000 + Math.random() * 3000);
  }

  window.CTTT = window.CTTT || {};
  window.CTTT.UI = {
    cacheDom: cacheDom,
    dom: dom,
    showScreen: showScreen,
    renderMark: renderMark,
    clearBoard: clearBoard,
    setCellsEnabled: setCellsEnabled,
    updateTurnIndicator: updateTurnIndicator,
    updateScores: updateScores,
    highlightWinningLine: highlightWinningLine,
    showResult: showResult,
    hideResult: hideResult,
    setMuteIcon: setMuteIcon,
    scheduleGlitchBursts: scheduleGlitchBursts
  };
})();
