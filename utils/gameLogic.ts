export type Player = 'X' | 'O' | null;
export type GameMode = 'PvP' | 'PvAI';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Impossible';

export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],            // Diagonals
];

export interface GameResult {
  winner: Player;
  winningLine: number[] | null;
  isDraw: boolean;
}

export function checkGameState(board: Player[]): GameResult {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: [a, b, c], isDraw: false };
    }
  }

  const isDraw = board.every((cell) => cell !== null);
  return { winner: null, winningLine: null, isDraw };
}

function minimax(
  board: Player[],
  depth: number,
  isMaximizing: boolean,
  aiPlayer: 'X' | 'O',
  humanPlayer: 'X' | 'O'
): number {
  const result = checkGameState(board);
  if (result.winner === aiPlayer) return 10 - depth;
  if (result.winner === humanPlayer) return depth - 10;
  if (result.isDraw) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = aiPlayer;
        const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = humanPlayer;
        const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function getBestMove(board: Player[], aiPlayer: 'X' | 'O'): number {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = aiPlayer;
      const score = minimax(board, 0, false, aiPlayer, humanPlayer);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function getRandomMove(board: Player[]): number {
  const availableMoves = board.map((val, index) => (val === null ? index : null)).filter((val) => val !== null) as number[];
  if (availableMoves.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}

export function getAIMove(board: Player[], difficulty: Difficulty, aiPlayer: 'X' | 'O'): number {
  const randomChance = Math.random();

  switch (difficulty) {
    case 'Easy':
      // 100% random
      return getRandomMove(board);
    case 'Medium':
      // 40% chance of optimal move, 60% random
      if (randomChance < 0.4) {
        return getBestMove(board, aiPlayer);
      }
      return getRandomMove(board);
    case 'Hard':
      // 80% chance of optimal move, 20% random
      if (randomChance < 0.8) {
        return getBestMove(board, aiPlayer);
      }
      return getRandomMove(board);
    case 'Impossible':
      // 100% optimal move using Minimax
      return getBestMove(board, aiPlayer);
    default:
      return getRandomMove(board);
  }
}
