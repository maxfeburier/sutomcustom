// src/components/utils.ts
import { LetterState } from "../types";

export const getCellClass = (
  cell: LetterState,
  rowIndex: number,
  currentRow: number,
  gameOver: boolean,
) => {
  let className = `cell ${cell.status}`;
  if (rowIndex === currentRow && !gameOver) {
    className += " current-row";
  }
  return className;
};
