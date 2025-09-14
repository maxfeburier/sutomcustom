import { useState } from "react";
import { MAX_ATTEMPTS } from "../constants";

export function useGameState({
  targetWord,
  currentRow,
  goToNextRow,
}: {
  targetWord: { word: string; id: number };
  currentRow: number;
  goToNextRow: () => void;
}) {
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState("");

  const checkWinOrLoose = (currentWord: string) => {
    if (currentWord === targetWord.word) {
      setWon(true);
      setGameOver(true);
      setMessage("Félicitations ! Vous avez trouvé le mot !");
    } else if (currentRow + 1 === MAX_ATTEMPTS) {
      setGameOver(true);
      setMessage(`Perdu ! Le mot était : ${targetWord.word}`);
    } else {
      goToNextRow();
    }
  };

  return {
    gameOver,
    setGameOver,
    won,
    setWon,
    message,
    setMessage,
    checkWinOrLoose,
  };
}
