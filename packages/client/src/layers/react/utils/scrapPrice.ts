export const scrapPrice = (x: number, y: number, level: number, defence: number, balance: number) => {
  const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  const build = 1_000_000 / distance;
  let levelCost = 0;
  for (let i = 2; i <= (level || 1); i++) {
    levelCost += Math.pow(i, 2) * 1_000;
  }
  const sellPrice = (100_000 / distance) * (balance || 0) * 0.9;
  const defencePercentage = +defence / (+level * 100);
  const scrapPrice = (sellPrice + levelCost + build) * defencePercentage * 0.25;
  return scrapPrice;
};
