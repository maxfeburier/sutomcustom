import React, { useCallback, useEffect, useState } from "react";
import "./Sutom.css";
import { InputDaysWord } from "./InputDaysWord";
import { Button } from "@mui/material";
import { Keyboard } from "./Keyboard";
import { supabase } from "../utils/supabase";
import PlayerSelector from "./PlayerSelector";
import { LetterState, playerType, wordType } from "../types";
import { getCellClass } from "../utils/utils";

const MAX_ATTEMPTS = 6;

export const callWordApi = async (attempt: string) => {
  const response1 = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${attempt.toLowerCase()}`,
  );
  if (response1.ok) {
    return true;
  }

  const response = await fetch(
    `https://freedictionaryapi.com/api/v1/entries/fr/${attempt.toLowerCase()}`,
  );
  if (!response.ok) {
    return false;
  }
  const data = (await response.json()) as { entries: any[] };
  if (data.entries && data.entries.length > 0) {
    return true;
  }
  return false;
};

export const Sutom: React.FC = () => {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState("");
  const [inputPaused, setInputPaused] = useState(false);
  const [player, setPlayer] = useState("");
  const [playerId, setPlayerId] = useState(1);
  const [players, setPlayers] = useState<playerType[]>();
  const [targetWord, setTargetWord] = useState<{ word: string; id: number }>({
    word: "",
    id: 0,
  });
  const [wordLength, setWordLength] = useState<number>(targetWord.word.length);
  const [grid, setGrid] = useState<LetterState[][]>([[]]);
  const [inWordLetters, setInWordLetters] = useState<string[]>([]);
  const [correctLetters, setCorrectLetters] = useState<string[]>([]);
  const [notInWordLetters, setNotInWordLetters] = useState<string[]>([]);

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

  const addedInWordLetter = (letter: string) => {
    setInWordLetters((prev) =>
      prev.includes(letter) ? prev : [...prev, letter],
    );
  };

  const addedCorrectLetter = (letter: string) => {
    setCorrectLetters((prev) =>
      prev.includes(letter) ? prev : [...prev, letter],
    );
  };

  const addedNotInWordLetter = (letter: string) => {
    setNotInWordLetters((prev) =>
      prev.includes(letter) ? prev : [...prev, letter],
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

  const correctLettersPlacement = (
    wordLetters: string[],
    targetLetters: string[],
    newGrid: LetterState[][],
  ) => {
    for (let i = 0; i < wordLength; i++) {
      if (wordLetters[i] === targetLetters[i]) {
        addedCorrectLetter(wordLetters[i]);
        newGrid[currentRow][i].status = "correct";
        targetLetters[i] = "";
        wordLetters[i] = "";
      }
    }
  };

  const wrongLettersPlacement = (
    wordLetters: string[],
    targetLetters: string[],
    newGrid: LetterState[][],
  ) => {
    for (let i = 0; i < wordLength; i++) {
      if (wordLetters[i] && targetLetters.includes(wordLetters[i])) {
        addedInWordLetter(wordLetters[i]);
        newGrid[currentRow][i].status = "present";
        const targetIndex = targetLetters.indexOf(wordLetters[i]);
        targetLetters[targetIndex] = "";
      } else if (wordLetters[i]) {
        addedNotInWordLetter(wordLetters[i]);
        newGrid[currentRow][i].status = "absent";
      }
    }
  };

  useEffect(() => {}, []);

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
    const currentWord = grid[currentRow].map((cell) => cell.letter).join("");
    if (await callWordApi(currentWord)) {
      const newGrid = [...grid];
      const targetLetters = targetWord.word.split("");
      const wordLetters = currentWord.split("");

      correctLettersPlacement(wordLetters, targetLetters, newGrid);
      wrongLettersPlacement(wordLetters, targetLetters, newGrid);

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
      } else if (key.match(/^[A-Z]$/) && currentCol < wordLength) {
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
      {message && (
        <h2
          className={`message ${won ? "success" : gameOver ? "error" : "info"}`}
        >
          {message}
        </h2>
      )}
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
