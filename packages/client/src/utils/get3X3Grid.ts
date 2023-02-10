export const get3x3Grid = (x: number, y: number) => {
  const grid = [];
  for (let i = x - 1; i <= x + 1; i++) {
    const row = [];
    for (let j = y - 1; j <= y + 1; j++) {
      row.push([i, j]);
    }
    grid.push(row);
  }
  return grid;
};
export const get10x10Grid = (x: number, y: number) => {
  const grid = [];
  for (let i = x - 5; i <= x + 4; i++) {
    const row = [];
    for (let j = y - 5; j <= y + 4; j++) {
      row.push([i, j]);
    }
    grid.push(row);
  }
  return grid;
};
