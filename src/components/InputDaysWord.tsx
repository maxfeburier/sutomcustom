import { Button, TextField } from "@mui/material";
import { supabase } from "../utils/supabase";
import { useEffect, useState } from "react";
import { callWordApi } from "../apicalls/callWordApi";
import { resetAttempts } from "../apicalls/attempsCall";
import { determinePlayerId } from "../utils/utils";

const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const InputDaysWord = ({
  setIsInputMode,
  isInputMode,
  playerId,
}: {
  isInputMode: boolean;
  playerId: number;
  setIsInputMode: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [word, setWord] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const changedWord = async (newWord: string) => {
      const response = await callWordApi(newWord);
      if (!response) {
        alert("Le mot n'est pas valide");
        return;
      }
      await supabase
        .from("actuals_words")
        .update({ word: newWord.toUpperCase() })
        .eq("from_player", playerId)
        .then((response) => {
          if (response.error) {
            console.error("Error updating word:", response.error);
          } else {
            supabase
              .from("attempts")
              .delete()
              .eq("player", determinePlayerId(playerId))
              .then((res) => {
                if (res.error) {
                  console.error("Error resetting attempts:", res.error);
                } else {
                  console.log("Attempts reset successfully:", res.data);
                }
              });
          }
        });
      setIsInputMode(false);
      setWord("");
    };
    if (submitted) {
      changedWord(removeAccents(word));
      setSubmitted(false);
      resetAttempts(determinePlayerId(playerId));
    }
  }, [submitted]);

  return (
    <div className="input-days-word">
      {isInputMode && (
        <>
          <TextField
            variant="filled"
            label="Mot du jour"
            className="day-word-input"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </>
      )}
      <div className="buttons-group">
        {isInputMode && (
          <Button
            variant="contained"
            onClick={() => {
              setSubmitted(true);
            }}
            className="submit-button"
          >
            Valider
          </Button>
        )}
        <Button
          variant="contained"
          color="warning"
          onClick={() => {
            setIsInputMode(!isInputMode);
            setWord("");
            setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 1);
          }}
          className="change-word-button"
        >
          {isInputMode ? "Annuler" : "définir le mot du jour"}
        </Button>
      </div>
    </div>
  );
};
