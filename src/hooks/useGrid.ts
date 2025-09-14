import { useState } from "react";
import { LetterState } from "../types";
import { MAX_ATTEMPTS } from "../constants";

export function useGrid({
  targetWord,
}: {
  targetWord: { word: string; id: number };
}) {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(1);
  const [grid, setGrid] = useState<LetterState[][]>([[]]);
  const [wordLength, setWordLength] = useState<number>(targetWord.word.length);

  const setupGrid = () => {
    setGrid(
      Array(MAX_ATTEMPTS)
        .fill(null)
        .map(() =>
          Array(wordLength)
            .fill(null)
            .map((value, index) => ({
              letter: index === 0 ? targetWord.word[0] : "",
              status: "empty" as const,
            }))
        )
    );
  };

  const goToNextRow = () => {
    setCurrentRow(currentRow + 1);
    setCurrentCol(1);
  };

  return {
    grid,
    currentRow,
    currentCol,
    setCurrentCol,
    setCurrentRow,
    setupGrid,
    goToNextRow,
    MAX_ATTEMPTS,
    wordLength,
    setWordLength,
    setGrid,
  };
}
