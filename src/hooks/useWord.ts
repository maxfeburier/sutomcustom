import { useState } from "react";
import { LetterState } from "../types";

export function useWord() {
  const [inWordLetters, setInWordLetters] = useState<string[]>([]);
  const [correctLetters, setCorrectLetters] = useState<string[]>([]);
  const [notInWordLetters, setNotInWordLetters] = useState<string[]>([]);

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

  const correctLettersPlacement = (
    wordLetters: string[],
    targetLetters: string[],
    newGrid: LetterState[][],
    wordLength: number,
    currentRow: number,
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
    wordLength: number,
    currentRow: number,
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

  return {
    inWordLetters,
    correctLetters,
    notInWordLetters,
    setInWordLetters,
    setCorrectLetters,
    setNotInWordLetters,
    correctLettersPlacement,
    wrongLettersPlacement,
  };
}
