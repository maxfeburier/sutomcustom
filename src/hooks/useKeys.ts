import { useCallback } from "react";

export function useKeys({
  gameOver,
  currentCol,
  wordLength,
  checkWord,
  grid,
  currentRow,
  setGrid,
  setCurrentCol,
  setMessage,
}: {
  gameOver: boolean;
  currentCol: number;
  wordLength: number;
  checkWord: () => void;
  grid: any[][];
  currentRow: number;
  setGrid: React.Dispatch<React.SetStateAction<any[][]>>;
  setCurrentCol: React.Dispatch<React.SetStateAction<number>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}) {
  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver) return;

      if (key === "ENTER") {
        if (currentCol === wordLength) {
          checkWord();
        } else {
          setMessage("Mot incomplet !");
        }
      } else if (key === "BACKSPACE") {
        if (currentCol > 1) {
          const newGrid = [...grid];
          newGrid[currentRow][currentCol - 1] = { letter: "", status: "empty" };
          setGrid(newGrid);
          setCurrentCol(currentCol - 1);
          setMessage("");
        }
      } else if (key.match(/^[A-Z.]$/) && currentCol < wordLength) {
        const newGrid = [...grid];
        newGrid[currentRow][currentCol] = { letter: key, status: "empty" };
        setGrid(newGrid);
        setCurrentCol(currentCol + 1);
        setMessage("");
      }
    },
    [gameOver, currentCol, wordLength, checkWord, grid, currentRow]
  );

  return { handleKeyPress };
}
