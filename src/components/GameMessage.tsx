import { Button } from "@mui/material";

export const GameMessage = ({
  showGridState,
  message,
  won,
  gameOver,
}: {
  showGridState(): string;
  message: string;
  won: boolean;
  gameOver: boolean;
}) => {
  return (
    <h2 className={`message ${won ? "success" : gameOver ? "error" : "info"}`}>
      {message}
      <br />
      {won && (
        <Button
          variant="contained"
          onClick={() => {
            navigator.clipboard.writeText(showGridState());
          }}
        >
          Partager
        </Button>
      )}
    </h2>
  );
};
