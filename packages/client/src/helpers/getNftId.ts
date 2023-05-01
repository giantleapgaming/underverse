import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Layers } from "../types";

export const getNftId = (layer: Layers): { tokenId: number; imageUrl: string } | undefined => {
  const {
    network: {
      components: { NFTID },
      nft: { walletNfts },
    },
    phaser: { getValue },
  } = layer;
  const selectedNft = getValue.SelectedNftID();
  if (selectedNft) {
    const doesExist = walletNfts.find((walletNftId) => walletNftId.tokenId === selectedNft);
    return doesExist;
  }
  const allNftIds = [...getComponentEntities(NFTID)].map((nftId) => {
    return +getComponentValueStrict(NFTID, nftId).value;
  });
  const doesExist = walletNfts.find((walletNftId) => allNftIds.includes(walletNftId.tokenId));
  return doesExist;
};

export const isOwnedBy = (layers: Layers) => {
  const {
    phaser: { getValue },
    network: {
      world,
      components: { OwnedBy, NFTID },
    },
  } = layers;

  const selectedEntity = getValue.SelectedEntity();
  if (selectedEntity) {
    const owner = getComponentValueStrict(OwnedBy, selectedEntity).value;
    const ownedNftId = world.entities.indexOf(owner);
    const nftId = getNftId(layers);
    const existingNftId = getComponentValue(NFTID, ownedNftId)?.value;
    if (existingNftId && nftId?.tokenId === +existingNftId) {
      return true;
    } else {
      return false;
    }
  }
  return;
};
export const isOwnedByIndex = (layers: Layers, index: number) => {
  const {
    network: {
      world,
      components: { OwnedBy, NFTID },
    },
  } = layers;

  if (index) {
    const owner = getComponentValue(OwnedBy, index)?.value;
    if (!owner) {
      return false;
    }
    const ownedNftId = world.entities.indexOf(owner);
    const nftId = getNftId(layers);
    const existingNftId = getComponentValue(NFTID, ownedNftId)?.value;
    if (existingNftId && nftId?.tokenId === +existingNftId) {
      return true;
    } else {
      return false;
    }
  }
  return;
};

export const ownedByName = (layers: Layers, index: number): string => {
  const {
    network: {
      world,
      components: { OwnedBy, Name },
    },
  } = layers;

  if (index) {
    const owner = getComponentValue(OwnedBy, index)?.value;
    if (!owner) {
      return "-";
    }
    const ownedNftId = world.entities.indexOf(owner);
    if (ownedNftId !== -1) {
      const name = getComponentValue(Name, ownedNftId)?.value;
      if (!name) {
        return "-";
      }
      return name;
    } else {
      return "-";
    }
  }
  return "-";
};
