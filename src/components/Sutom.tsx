import React, { useCallback, useEffect, useState } from "react";
import "./Sutom.css";
import { InputDaysWord } from "./InputDaysWord";
import { Button } from "@mui/material";
import { Keyboard } from "./Keyboard";
import { supabase } from "../utils/supabase";
import PlayerSelector from "./PlayerSelector";
import { LetterState, playerType, wordType } from "../types";
import { getCellClass } from "../utils/utils";
import { callWordApi } from "../apicalls/callWordApi";
import { GameMessage } from "./GameMessage";
import { useWord } from "../hooks/useWord";

const MAX_ATTEMPTS = 6;

export const Sutom: React.FC = () => {
  //découpage état position
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(1);

  //decoupage état de jeu
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState("");

  //découpage état input
  const [inputPaused, setInputPaused] = useState(false);

  //découpage état joueur
  const [player, setPlayer] = useState("");
  const [playerId, setPlayerId] = useState(1);
  const [players, setPlayers] = useState<playerType[]>();

  //découpage état mot
  const [targetWord, setTargetWord] = useState<{ word: string; id: number }>({
    word: "",
    id: 0,
  });
  const [wordLength, setWordLength] = useState<number>(targetWord.word.length);
  const [grid, setGrid] = useState<LetterState[][]>([[]]);

  const {
    inWordLetters,
    correctLetters,
    notInWordLetters,
    setInWordLetters,
    setCorrectLetters,
    setNotInWordLetters,
    correctLettersPlacement,
    wrongLettersPlacement,
  } = useWord();

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
            })),
        ),
    );
  };

  const goToNextRow = () => {
    setCurrentRow(currentRow + 1);
    setCurrentCol(1);
  };

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

  const resetGame = () => {
    setupGrid();
    setCurrentRow(0);
    setCurrentCol(1);
    setGameOver(false);
    setWon(false);
    setMessage("");
    setInWordLetters([]);
    setCorrectLetters([]);
    setNotInWordLetters([]);
  };

  useEffect(() => {
    async function getWordsForMe() {
      const { data: words } = await supabase
        .from("actuals_words")
        .select("word,id")
        .eq("to_player", playerId);

      if (words && words.length > 0) {
        const typedWords: wordType = words[0] as wordType;
        setTargetWord(typedWords);
        setWordLength(words[0].word.length);
      } else {
        setTargetWord({ word: "", id: 0 });
        setWordLength(0);
      }
    }
    getWordsForMe();
  }, [playerId]);

  useEffect(() => {
    resetGame();
  }, [playerId, targetWord]);

  const checkWord = useCallback(async () => {
    const currentWord = grid[currentRow]
      .map((cell) => cell.letter)
      .join("")
      .replace(".", "");
    if (currentWord.length === wordLength) {
      if (!(await callWordApi(currentWord))) {
        setMessage("Mot non reconnu !");
        return;
      }
      const newGrid = [...grid];
      const targetLetters = targetWord.word.split("");
      const wordLetters = currentWord.split("");

      correctLettersPlacement(
        wordLetters,
        targetLetters,
        newGrid,
        wordLength,
        currentRow,
      );
      wrongLettersPlacement(
        wordLetters,
        targetLetters,
        newGrid,
        wordLength,
        currentRow,
      );

      setGrid(newGrid);
      setMessage("");

      checkWinOrLoose(currentWord);

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
    }
    if (currentWord.length !== wordLength) {
      setMessage("Mot incomplet !");
      return;
    }
  }, [grid, currentRow, currentCol]);

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
    [gameOver, currentCol, wordLength, checkWord, grid, currentRow],
  );

  useEffect(() => {
    if (!inputPaused) {
      const handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toUpperCase();
        handleKeyPress(key);
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyPress, inputPaused]);

  return (
    <div className="sutom-container">
      <h1>Batard & Morue</h1>
      <PlayerSelector
        players={players}
        player={player}
        setPlayer={setPlayer}
        setPlayers={setPlayers}
        setPlayerId={setPlayerId}
      />

      <GameMessage message={message} won={won} gameOver={gameOver} />

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

      <Keyboard
        inWordLetters={inWordLetters}
        correctLetters={correctLetters}
        notInWordLetters={notInWordLetters}
        handleKeyPress={handleKeyPress}
      />

      {gameOver && (
        <div className="game-controls">
          <Button
            variant="contained"
            onClick={resetGame}
            className="reset-button"
          >
            Nouvelle partie
          </Button>
        </div>
      )}
      <br />
      <InputDaysWord
        playerId={playerId}
        isInputMode={inputPaused}
        setIsInputMode={setInputPaused}
      />
      <br />
    </div>
  );
};

export default Sutom;
