export function isWithinCircle(x: number, y: number) {
  return x * x + y * y <= 625; // 25^2 = 625
}

export function findSector(x: number, y: number) {
  // Check if the point is within the circle
  if (!isWithinCircle(x, y)) {
    return 0;
  }
  let theta = Math.atan2(y, x);
  if (theta < 0) {
    theta = theta + 2 * Math.PI;
  }
  const sector = Math.floor(theta / ((2 * Math.PI) / 12)) + 1;
  return sector;
}
