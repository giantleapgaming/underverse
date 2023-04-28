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
