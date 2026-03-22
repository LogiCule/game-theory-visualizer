export type TreeNode<TState = any, TMove = any> = {
  id: string;
  move?: TMove;
  children?: TreeNode<TState, TMove>[];
  score?: number | string;
  label?: string;
  isBest?: boolean;
  depth: number;
};
