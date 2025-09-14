// src/components/utils.ts
import { LetterState } from "../types";

export const getCellClass = (
  cell: LetterState,
  rowIndex: number,
  currentRow: number,
  gameOver: boolean
) => {
  let className = `cell ${cell.status}`;
  if (rowIndex === currentRow && !gameOver) {
    className += " current-row";
  }
  return className;
};

export const getKeyBoardKeyClass = (
  key: string,
  inWordLetters: string[],
  correctLetters: string[],
  notInWordLetters: string[]
) => {
  let className = "key";
  if (correctLetters.includes(key)) {
    className += " correct";
  } else if (inWordLetters.includes(key)) {
    className += " present";
  } else if (notInWordLetters.includes(key)) {
    className += " absent";
  }
  return className;
};

export const determinePlayerId = (playerId: number) => {
  return playerId === 1 ? 2 : playerId === 2 ? 1 : 0;
};
