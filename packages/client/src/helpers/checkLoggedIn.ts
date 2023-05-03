import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { Layers } from "../types";

export const checkLoggedIn = (layers: Layers) => {
  const {
    phaser: { getValue },
    network: {
      components: { NFTID },
    },
  } = layers;

  const selectedNftId = getValue.SelectedNftID();
  const allNftsEntityIds = [...getComponentEntities(NFTID)];

  const doesNftExist = allNftsEntityIds.some((entityId) => {
    const selectedNft = getComponentValueStrict(NFTID, entityId).value;
    return +selectedNft === selectedNftId;
  });
  return doesNftExist;
};
export const getPlayerJoinedNumber = (layers: Layers) => {
  const {
    phaser: { getValue },
    network: {
      components: { NFTID, PlayerCount },
    },
  } = layers;

  const selectedNftId = getValue.SelectedNftID();
  const allNftsEntityIds = [...getComponentEntities(NFTID)];

  const doesNftExist = allNftsEntityIds.find((entityId) => {
    const selectedNft = getComponentValueStrict(NFTID, entityId).value;
    return +selectedNft === selectedNftId;
  });
  if (doesNftExist) {
    return +getComponentValueStrict(PlayerCount, doesNftExist).value;
  } else {
    return undefined;
  }
};
