import { LetterState } from "../types";
import { getCellClass } from "../utils/utils";

export const Grid = ({
  grid,
  currentRow,
  gameOver,
  wordLength,
}: {
  grid: LetterState[][];
  currentRow: number;
  gameOver: boolean;
  wordLength: number;
}) => {
  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, cellIndex) => (
            <div
              style={{
                width: `${Math.min(400, window.innerWidth - 150) / wordLength}px`,
                height: `${Math.min(400, window.innerWidth - 150) / wordLength}px`,
              }}
              key={cellIndex}
              className={getCellClass(cell, rowIndex, currentRow, gameOver)}
            >
              {cell.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
