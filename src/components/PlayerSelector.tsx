import React, { useEffect } from "react";
import { MenuItem, Select } from "@mui/material";
import { supabase } from "../utils/supabase";
import { playerType } from "../types";

type PlayerType = {
  id: number;
  name: string;
};

interface PlayerSelectorProps {
  players?: PlayerType[];
  player: string;
  setPlayer: (name: string) => void;
  setPlayers: React.Dispatch<React.SetStateAction<playerType[] | undefined>>;
  setPlayerId: (id: number) => void;
}

export const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  players,
  player,
  setPlayer,
  setPlayers,
  setPlayerId,
}) => {
  useEffect(() => {
    async function getAllPlayers() {
      const { data: players } = await supabase.from("players").select();

      if (players && players.length > 1) {
        const typedPlayers: playerType[] = players.map((p) => ({
          id: p.id,
          name: p.name,
        }));
        setPlayers(typedPlayers);
        setPlayer(typedPlayers[0].name);
        setPlayerId(players[0].id);
      }
    }
    getAllPlayers();
  }, []);

  return (
    <div className="row">
      <p className="white-text">Qui est en train de jouer ?</p>
      <Select
        onChange={(e) => {
          setPlayer(e.target.value as string);
          const selectedPlayer = players?.find(
            (p) => p.name === e.target.value,
          );
          if (selectedPlayer) {
            setPlayerId(selectedPlayer.id);
          }
        }}
        value={player}
      >
        {players &&
          players.length > 0 &&
          players.map((p) => (
            <MenuItem key={p.id} value={p.name}>
              {p.name}
            </MenuItem>
          ))}
      </Select>
    </div>
  );
};

export default PlayerSelector;
