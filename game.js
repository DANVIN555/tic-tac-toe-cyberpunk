(function () {
  'use strict';

  var WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function createState() {
    return {
      board: new Array(9).fill(null),
      currentPlayer: 'X',
      mode: null,
      humanSymbol: 'X',
      aiSymbol: 'O',
      gameOver: false,
      winner: null,
      winningLine: null,
      scores: { X: 0, O: 0, draw: 0 }
    };
  }

  function checkWinner(board) {
    for (var i = 0; i < WIN_PATTERNS.length; i++) {
      var line = WIN_PATTERNS[i];
      var a = line[0], b = line[1], c = line[2];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: line };
      }
    }
    return { winner: null, line: null };
  }

  function isBoardFull(board) {
    return board.every(function (v) { return v !== null; });
  }

  function getEmptyIndices(board) {
    var out = [];
    for (var i = 0; i < board.length; i++) {
      if (board[i] === null) out.push(i);
    }
    return out;
  }

  function makeMove(board, index, player) {
    if (board[index] !== null) return false;
    board[index] = player;
    return true;
  }

  window.CTTT = window.CTTT || {};
  window.CTTT.Game = {
    WIN_PATTERNS: WIN_PATTERNS,
    createState: createState,
    checkWinner: checkWinner,
    isBoardFull: isBoardFull,
    getEmptyIndices: getEmptyIndices,
    makeMove: makeMove
  };
})();
