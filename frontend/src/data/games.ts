export type GameMeta = {
  id: string;
  name: string;
  description: string;
  rules: string;
  route: string;
  tags: string[];
};

export const games: GameMeta[] = [
  {
    id: "stone-game-1",
    name: "Stone Game I",
    description: "Two players pick stones from either end of a row of piles. Both players play optimally. Defeat your opponent through perfect calculation.",
    rules: "There are several piles of stones arranged in a row. On each turn, a player can remove either the first pile or the last pile from the row. The game ends when all piles have been removed. The goal is to maximize your total score (number of stones collected). Calculate the optimal outcome assuming both players play perfectly.",
    route: "/games/stone-game",
    tags: ["DP", "Minimax"]
  },
  {
    id: "stone-game-2",
    name: "Stone Game II",
    description: "Take up to 2M stones from the front of the line. M scales up dynamically. Plan your exponential expansion.",
    rules: "Piles of stones are arranged in a row. You start with a multiplier M = 1. On your turn, you can take between 1 and 2*M contiguous piles from the absolute front of the row. After making your move, the multiplier M becomes max(M, X) where X is the number of piles you took. The game ends when all piles are taken. Play optimally to maximize your score.",
    route: "/games/stone-game-2",
    tags: ["DP", "Math"]
  },
  {
    id: "stone-game-3",
    name: "Stone Game III",
    description: "A ruthless battle where stones have values that can be negative. Take 1, 2, or 3 stones from the front.",
    rules: "You are given piles of stones where each stone has a value (can be negative). On your turn, you must take 1, 2, or 3 stones from the absolute front of the row. Your score is the sum of the values of the stones you take. Play optimally to maximize your score relative to your opponent's score.",
    route: "/games/stone-game-3",
    tags: ["DP", "Greedy"]
  },
  {
    id: "nim-game",
    name: "Nim Game",
    description: "Remove stones optimally using XOR strategy.",
    rules: "There is a single pile of stones. Players alternate turns. On each turn, a player can remove exactly 1, 2, or 3 stones from the pile. The player who removes the last stone wins. If you play optimally, it is impossible for your opponent to win from certain configurations.",
    route: "/games/nim",
    tags: ["Combinatorics", "Modulo", "Zero-Sum", "Heap"]
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'The classic grid-based showdown. Alice is X, Bob is O.',
    rules: 'Players take turns marking an empty cell in a 3x3 grid (Alice=X, Bob=O). The first player to get 3 marks in a horizontal, vertical, or diagonal row wins. If the board fills completely without a winner, the game is a tie. Playing perfectly guarantees at least a tie.',
    route: '/games/tic-tac-toe',
    tags: ['Grid', 'Zero-Sum', 'Solved', 'Classic']
  }
];
