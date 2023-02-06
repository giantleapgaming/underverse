export const distance = (sourceX: number, sourceY: number, destinationX: number, destinationY: number) => {
  if (
    typeof sourceX === "number" &&
    typeof sourceY === "number" &&
    typeof destinationX === "number" &&
    typeof destinationY === "number"
  ) {
    return Math.sqrt(Math.pow(destinationX - sourceX, 2) + Math.pow(destinationY - sourceY, 2));
  }
  return 0;
};
