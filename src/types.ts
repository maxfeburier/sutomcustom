export interface LetterState {
  letter: string;
  status: "correct" | "present" | "absent" | "empty";
}

export type playerType = {
  id: number;
  name: string;
};

export type wordType = {
  id: number;
  word: string;
  to_player: number;
};
