import React, { useCallback, useEffect, useState } from "react";
import "./Sutom.css";
import { InputDaysWord } from "./InputDaysWord";
import { Button } from "@mui/material";
import { Keyboard } from "./Keyboard";
import { supabase } from "../utils/supabase";
import { PlayerSelector } from "./PlayerSelector";
import { wordType } from "../types";
import { callWordApi } from "../apicalls/callWordApi";
import { GameMessage } from "./GameMessage";
import { useWord } from "../hooks/useWord";
import { Grid } from "./Grid";
import { useGrid } from "../hooks/useGrid";
import { useKeys } from "../hooks/useKeys";
import { useGameState } from "../hooks/useGameState";
import { usePlayer } from "../hooks/usePlayer";
import { loadAttempts, saveAttempt } from "../apicalls/attempsCall";

export type Attempts = {
  attempt: string;
  attempt_number: number;
  player: number;
  word_id: number;
};

export const Sutom: React.FC = () => {
  const [inputPaused, setInputPaused] = useState(false);

  const [targetWord, setTargetWord] = useState<{ word: string; id: number }>({
    word: "",
    id: 0,
  });

  const [attempts, setAttempts] = useState<Attempts[]>([]);

  const { player, setPlayer, playerId, setPlayerId, players, setPlayers } =
    usePlayer();

  const {
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
  } = useGrid({
    targetWord,
  });

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

  const {
    gameOver,
    setGameOver,
    won,
    setWon,
    message,
    setMessage,
    checkWinOrLoose,
  } = useGameState({
    targetWord,
    currentRow,
    goToNextRow,
  });

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

  const applyLettersStatus = (
    wordLetters: string[],
    targetLetters: string[],
    newGrid: any[],
    wordLength: number,
    currentRowTemp: number
  ) => {
    correctLettersPlacement(
      wordLetters,
      targetLetters,
      newGrid,
      wordLength,
      currentRowTemp
    );

    wrongLettersPlacement(
      wordLetters,
      targetLetters,
      newGrid,
      wordLength,
      currentRowTemp
    );
  };

  const loadPreviousAttempts = () => {
    let currentRowTemp = currentRow;
    attempts.forEach((word) => {
      if (word.attempt.length !== wordLength) return;
      const newGrid = [...grid];
      word.attempt.split("").forEach((letter, index) => {
        newGrid[currentRowTemp][index] = { letter, status: "empty" };
      });
      const targetLetters = targetWord.word.split("");
      const wordLetters = word.attempt.split("");

      applyLettersStatus(
        wordLetters,
        targetLetters,
        newGrid,
        wordLength,
        currentRowTemp
      );

      setGrid(newGrid);
      if (word.attempt === targetWord.word) {
        setWon(true);
        setGameOver(true);
        setMessage("Félicitations ! Vous avez trouvé le mot !");
        return;
      }
      currentRowTemp += 1;
      setCurrentRow(currentRowTemp);
    });
  };

  useEffect(() => {
    loadPreviousAttempts();
  }, [wordLength, attempts]);

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
        loadAttempts(playerId, typedWords.id).then((data) => {
          if (data && data.length > 0) {
            setAttempts(data);
          }
        });
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

  const showWin = () => {
    setWon(true);
    setGameOver(true);
    setMessage("Félicitations ! Vous avez trouvé le mot !");
  };

  const showLose = () => {
    setGameOver(true);
    setMessage(`Perdu ! Le mot était : ${targetWord.word}`);
  };

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
      const attempToAdd: Attempts = {
        player: playerId,
        word_id: targetWord.id,
        attempt: currentWord,
        attempt_number: currentRow + 1,
      };
      const newGrid = [...grid];
      const targetLetters = targetWord.word.split("");
      const wordLetters = currentWord.split("");

      applyLettersStatus(
        wordLetters,
        targetLetters,
        newGrid,
        wordLength,
        currentRow
      );

      setGrid(newGrid);
      setMessage("");

      checkWinOrLoose(currentWord);

      if (currentWord === targetWord.word) {
        showWin();
      } else if (currentRow + 1 === MAX_ATTEMPTS) {
        showLose();
      } else {
        goToNextRow();
      }
      saveAttempt(attempToAdd);
    } else if (currentWord.length !== wordLength) {
      setMessage("Mot incomplet !");
      return;
    }
  }, [grid, currentCol]);

  const { handleKeyPress } = useKeys({
    gameOver,
    currentCol,
    wordLength,
    checkWord,
    grid,
    currentRow,
    setGrid,
    setCurrentCol,
    setMessage,
  });

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

      <Grid
        grid={grid}
        currentRow={currentRow}
        gameOver={gameOver}
        wordLength={wordLength}
      />

      <Keyboard
        inWordLetters={inWordLetters}
        correctLetters={correctLetters}
        notInWordLetters={notInWordLetters}
        handleKeyPress={handleKeyPress}
      />
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
