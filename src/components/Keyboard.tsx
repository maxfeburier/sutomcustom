import React from "react";
import { Button } from "@mui/material";
import BackspaceIcon from "@mui/icons-material/Backspace";
import CheckIcon from "@mui/icons-material/Check";
import { getKeyBoardKeyClass } from "../utils/utils";

export const Keyboard = ({
  handleKeyPress,
  inWordLetters,
  correctLetters,
  notInWordLetters,
}: {
  handleKeyPress: (key: string) => void;
  inWordLetters: string[];
  correctLetters: string[];
  notInWordLetters: string[];
}) => {
  return (
    <>
      <div className="keyboard">
        {"AZERTYUIOPQSDFGHJKLMWXCVBN".split("").map((key) => (
          <button
            key={key}
            onClick={() => handleKeyPress(key)}
            className={`${getKeyBoardKeyClass(
              key,
              inWordLetters,
              correctLetters,
              notInWordLetters,
            )}`}
          >
            {key}
          </button>
        ))}
        <br />
        {"".split("").map((key) => (
          <button key={key} onClick={() => handleKeyPress(key)} className="key">
            {key}
          </button>
        ))}
        <br />

        {"".split("").map((key) => (
          <button key={key} onClick={() => handleKeyPress(key)} className="key">
            {key}
          </button>
        ))}
      </div>
      <br />
      <div className="row gapped-buttons">
        <Button
          color="error"
          variant="contained"
          onClick={() => handleKeyPress("BACKSPACE")}
          className=""
        >
          <BackspaceIcon />
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => handleKeyPress("ENTER")}
          className=""
        >
          <CheckIcon />
        </Button>
      </div>
    </>
  );
};
