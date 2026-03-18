export type GameMeta = {
  id: string;
  name: string;
  description: string;
  route: string;
  tags: string[];
};

export const games: GameMeta[] = [
  {
    id: "stone-game-1",
    name: "Stone Game I",
    description: "Two players pick stones from either end of a row of piles. Both players play optimally. Defeat your opponent through perfect calculation.",
    route: "/games/stone-game",
    tags: ["DP", "Minimax"]
  },
  {
    id: "stone-game-2",
    name: "Stone Game II",
    description: "Take up to 2M stones from the front of the line. M scales up dynamically. Plan your exponential expansion.",
    route: "/games/stone-game-2",
    tags: ["DP", "Math"]
  },
  {
    id: "stone-game-3",
    name: "Stone Game III",
    description: "A ruthless battle where stones have values that can be negative. Take 1, 2, or 3 stones from the front.",
    route: "/games/stone-game-3",
    tags: ["DP", "Greedy"]
  }
];
