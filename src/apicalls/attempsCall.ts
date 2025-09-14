import { Attempts } from "../components/Sutom";
import { supabase } from "../utils/supabase";

export const loadAttempts = async (playerId: number, wordId: number) => {
  const { data, error } = await supabase
    .from("attempts")
    .select("attempt, attempt_number, player, word_id")
    .eq("player", playerId)
    .eq("word_id", wordId);

  if (error) {
    console.error("Error loading attempts:", error);
    return [];
  }

  return data.sort((a, b) => a.attempt_number - b.attempt_number);
};

export const saveAttempt = async (attemps: Attempts) => {
  const { data, error } = await supabase.from("attempts").insert([
    {
      player: attemps.player,
      word_id: attemps.word_id,
      attempt: attemps.attempt,
      attempt_number: attemps.attempt_number,
    },
  ]);

  if (error) {
    console.error("Error saving attempt:", error);
    return null;
  }

  return data;
};

export const resetAttempts = async (playerId: number) => {
  const { data, error } = await supabase
    .from("attempts")
    .delete()
    .eq("player_id", playerId);

  if (error) {
    console.error("Error resetting attempts:", error);
    return null;
  }

  return data;
};
