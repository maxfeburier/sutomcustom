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
        {"AZERTYUIOPQSDFGHJKLMWXCVBN.".split("").map((key) => (
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
        <Button
          variant="contained"
          color="error"
          onClick={() => handleKeyPress("BACKSPACE")}
          className="backspace-key"
        >
          <BackspaceIcon />
        </Button>
        <br />
      </div>
      <div className="row gapped-buttons">
        <Button
          variant="contained"
          color="success"
          onClick={() => handleKeyPress("ENTER")}
          className="validate-key"
        >
          <CheckIcon />
        </Button>
      </div>
    </>
  );
};
