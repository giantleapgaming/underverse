import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Layers } from "../../../types";
import { NetworkLayer } from "../../network/types";

const getNftId = (
  network: NetworkLayer
):
  | {
      tokenId: number;
      imageUrl: string;
    }
  | undefined => {
  const {
    components: { NFTID },
    walletNfts,
  } = network;
  const allNftIds = [...getComponentEntities(NFTID)].map((nftId) => {
    return +getComponentValueStrict(NFTID, nftId).value;
  });
  const doesExist = walletNfts.find((walletNftId) => allNftIds.includes(walletNftId.tokenId));
  return doesExist;
};
export { getNftId };

export const isOwnedBy = (layers: Layers) => {
  const {
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
    },
    network: {
      world,
      components: { OwnedBy, NFTID },
    },
  } = layers;

  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const owner = getComponentValueStrict(OwnedBy, selectedEntity).value;
    const ownedNftId = world.entities.indexOf(owner);
    const nftId = getNftId(layers.network);
    const existingNftId = getComponentValue(NFTID, ownedNftId)?.value;
    if (existingNftId && nftId?.tokenId === +existingNftId) {
      return true;
    } else {
      return false;
    }
  }
  return;
};
