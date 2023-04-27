import { factionData } from "../../../utils/constants";

export const repairPrice = (x: number, y: number, level: number, defence: number, faction: number) => {
  const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  const build = 1_000_000 / distance;
  const factionRepairPercent = factionData[faction]?.repair;
  let levelCost = 0;
  for (let i = 2; i <= (level || 1); i++) {
    levelCost += Math.pow(i, 2) * 1_000;
  }
  const defenceLevel = level ? +level * 100 : 0;
  const damageTake = defenceLevel - +defence;
  const damagePer = (damageTake / defenceLevel) * 100;
  const repairPrice = (((build + levelCost) * damagePer) / 100) * factionRepairPercent;
  return repairPrice;
};
