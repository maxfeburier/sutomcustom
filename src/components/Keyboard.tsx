import React from "react";
import { Button } from "@mui/material";
import BackspaceIcon from "@mui/icons-material/Backspace";
import CheckIcon from "@mui/icons-material/Check";

export const Keyboard = ({
  handleKeyPress,
}: {
  handleKeyPress: (key: string) => void;
}) => {
  return (
    <>
      <div className="keyboard">
        {"AZERTYUIOPQSDFGHJKLMWXCVBN".split("").map((key) => (
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
