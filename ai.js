(function () {
  'use strict';

  var Game = window.CTTT.Game;

  function minimax(board, depth, isMaximizing, aiPlayer, humanPlayer, alpha, beta) {
    var result = Game.checkWinner(board);
    if (result.winner === aiPlayer) return 10 - depth;
    if (result.winner === humanPlayer) return depth - 10;
    if (Game.isBoardFull(board)) return 0;

    var empties = Game.getEmptyIndices(board);

    if (isMaximizing) {
      var best = -Infinity;
      for (var i = 0; i < empties.length; i++) {
        var idx = empties[i];
        board[idx] = aiPlayer;
        best = Math.max(best, minimax(board, depth + 1, false, aiPlayer, humanPlayer, alpha, beta));
        board[idx] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      var worst = Infinity;
      for (var j = 0; j < empties.length; j++) {
        var idx2 = empties[j];
        board[idx2] = humanPlayer;
        worst = Math.min(worst, minimax(board, depth + 1, true, aiPlayer, humanPlayer, alpha, beta));
        board[idx2] = null;
        beta = Math.min(beta, worst);
        if (beta <= alpha) break;
      }
      return worst;
    }
  }

  function getBestMove(board, aiPlayer, humanPlayer) {
    var empties = Game.getEmptyIndices(board);
    if (empties.length === 0) return -1;

    var bestScore = -Infinity;
    var bestMoves = [];

    for (var i = 0; i < empties.length; i++) {
      var idx = empties[i];
      board[idx] = aiPlayer;
      var score = minimax(board, 0, false, aiPlayer, humanPlayer, -Infinity, Infinity);
      board[idx] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [idx];
      } else if (score === bestScore) {
        bestMoves.push(idx);
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  window.CTTT = window.CTTT || {};
  window.CTTT.AI = {
    getBestMove: getBestMove
  };
})();
