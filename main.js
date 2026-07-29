(function () {
  'use strict';

  var Game = window.CTTT.Game;
  var AI = window.CTTT.AI;
  var Sound = window.CTTT.Sound;
  var UI = window.CTTT.UI;

  var state = Game.createState();
  var aiTimeoutId = null;
  var pendingAiSymbol = 'X';

  function clearAiTimeout() {
    if (aiTimeoutId) {
      clearTimeout(aiTimeoutId);
      aiTimeoutId = null;
    }
  }

  function resetRound() {
    clearAiTimeout();
    state.board = new Array(9).fill(null);
    state.currentPlayer = 'X';
    state.gameOver = false;
    state.winner = null;
    state.winningLine = null;

    UI.clearBoard();
    UI.hideResult();
    UI.updateTurnIndicator(state.currentPlayer);
    setCellsInteractive();

    if (state.mode === 'ai' && state.currentPlayer === state.aiSymbol) {
      scheduleAiMove();
    }
  }

  function setCellsInteractive() {
    var aiTurn = state.mode === 'ai' && state.currentPlayer === state.aiSymbol;
    UI.setCellsEnabled(!state.gameOver && !aiTurn);
  }

  function afterMove(index, player) {
    UI.renderMark(index, player);
    Sound.playMoveSound(player);

    var result = Game.checkWinner(state.board);

    if (result.winner) {
      state.gameOver = true;
      state.winner = result.winner;
      state.winningLine = result.line;
      finishGame(result.winner, result.line);
      return;
    }

    if (Game.isBoardFull(state.board)) {
      state.gameOver = true;
      state.winner = 'draw';
      finishGame('draw', null);
      return;
    }

    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    UI.updateTurnIndicator(state.currentPlayer);
    setCellsInteractive();

    if (state.mode === 'ai' && state.currentPlayer === state.aiSymbol) {
      scheduleAiMove();
    }
  }

  function finishGame(outcome, line) {
    UI.setCellsEnabled(false);

    setTimeout(function () {
      if (line) UI.highlightWinningLine(line);

      if (outcome === 'draw') {
        state.scores.draw++;
        Sound.playDrawSound();
      } else {
        state.scores[outcome]++;
        if (state.mode === 'pvp') {
          Sound.playWinSound();
        } else if (outcome === state.humanSymbol) {
          Sound.playWinSound();
        } else {
          Sound.playLoseSound();
        }
      }

      UI.updateScores(state.scores);

      setTimeout(function () {
        UI.showResult(outcome, state.mode, state.humanSymbol);
      }, 550);
    }, 250);
  }

  function scheduleAiMove() {
    clearAiTimeout();
    UI.setCellsEnabled(false);
    var delay = 300 + Math.random() * 300;
    aiTimeoutId = setTimeout(function () {
      aiTimeoutId = null;
      if (state.gameOver) return;
      var idx = AI.getBestMove(state.board, state.aiSymbol, state.humanSymbol);
      if (idx === -1) return;
      Game.makeMove(state.board, idx, state.aiSymbol);
      afterMove(idx, state.aiSymbol);
    }, delay);
  }

  function handleCellClick(evt) {
    var cell = evt.currentTarget;
    var index = Number(cell.dataset.index);

    if (state.gameOver) return;
    if (state.board[index] !== null) return;
    if (state.mode === 'ai' && state.currentPlayer === state.aiSymbol) return;

    Game.makeMove(state.board, index, state.currentPlayer);
    afterMove(index, state.currentPlayer);
  }

  function startGame(mode) {
    state.mode = mode;
    if (mode === 'pvp') {
      state.humanSymbol = 'X';
      state.aiSymbol = 'O';
    } else {
      state.humanSymbol = pendingAiSymbol;
      state.aiSymbol = pendingAiSymbol === 'X' ? 'O' : 'X';
    }
    UI.showScreen('game');
    resetRound();
  }

  function goToMenu() {
    clearAiTimeout();
    state.mode = null;
    UI.hideResult();
    UI.showScreen('menu');
  }

  function bindEvents() {
    var dom = UI.dom;

    dom.btnModePvp.addEventListener('click', function () {
      Sound.resume();
      startGame('pvp');
    });

    dom.btnModeAi.addEventListener('click', function () {
      Sound.resume();
      dom.aiOptions.classList.toggle('hidden');
    });

    dom.btnSymbolX.addEventListener('click', function () {
      pendingAiSymbol = 'X';
      dom.btnSymbolX.classList.add('selected');
      dom.btnSymbolO.classList.remove('selected');
    });

    dom.btnSymbolO.addEventListener('click', function () {
      pendingAiSymbol = 'O';
      dom.btnSymbolO.classList.add('selected');
      dom.btnSymbolX.classList.remove('selected');
    });

    dom.btnStartAi.addEventListener('click', function () {
      startGame('ai');
    });

    dom.cells.forEach(function (cell) {
      cell.addEventListener('click', handleCellClick);
    });

    dom.btnRestart.addEventListener('click', function () {
      resetRound();
    });

    dom.btnMenu.addEventListener('click', goToMenu);

    dom.btnPlayAgain.addEventListener('click', function () {
      UI.hideResult();
      resetRound();
    });

    dom.btnResultMenu.addEventListener('click', function () {
      UI.hideResult();
      goToMenu();
    });

    dom.muteBtn.addEventListener('click', function () {
      var muted = Sound.toggleMuted();
      UI.setMuteIcon(muted);
    });

    var allButtons = document.querySelectorAll('.btn');
    allButtons.forEach(function (btn) {
      btn.addEventListener('mouseenter', function () { Sound.playHoverSound(); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    UI.cacheDom();
    bindEvents();
    UI.setMuteIcon(Sound.isMuted());
    UI.scheduleGlitchBursts();
    window.CTTT.Background.init();
  });
})();
