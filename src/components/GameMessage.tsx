export const GameMessage = ({
  message,
  won,
  gameOver,
}: {
  message: string;
  won: boolean;
  gameOver: boolean;
}) => {
  return (
    <h2 className={`message ${won ? "success" : gameOver ? "error" : "info"}`}>
      {message}
    </h2>
  );
};
