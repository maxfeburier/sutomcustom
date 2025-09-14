import { useState } from "react";
import { playerType } from "../types";

export function usePlayer() {
  const [player, setPlayer] = useState("");
  const [playerId, setPlayerId] = useState(1);
  const [players, setPlayers] = useState<playerType[]>();
  return { player, setPlayer, playerId, setPlayerId, players, setPlayers };
}
