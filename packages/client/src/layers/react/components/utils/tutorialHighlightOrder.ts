import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Layers } from "../../../../types";
import { getNftId } from "../../../network/utils/getNftId";

export const tutorialHighlightOrderCompleted = (layers: Layers, number: number): boolean => {
  const {
    network: {
      components: { NFTID, TutorialStep },
    },
  } = layers;
  const nftDetails = getNftId(layers);
  const nftEntity = [...getComponentEntities(NFTID)].find((nftId) => {
    const id = +getComponentValueStrict(NFTID, nftId).value;
    return nftDetails?.tokenId === id;
  });
  const currentNumber = getComponentValue(TutorialStep, nftEntity)?.value;
  if (typeof currentNumber === "string" && currentNumber >= number) {
    return true;
  } else {
    return false;
  }
};

export const tutorialHighlightOrderPresent = (layers: Layers, number: number): boolean => {
  const {
    network: {
      components: { NFTID, TutorialStep },
    },
  } = layers;
  const nftDetails = getNftId(layers);
  const nftEntity = [...getComponentEntities(NFTID)].find((nftId) => {
    const id = +getComponentValueStrict(NFTID, nftId).value;
    return nftDetails?.tokenId === id;
  });
  const currentNumber = getComponentValue(TutorialStep, nftEntity)?.value;
  if (typeof currentNumber === "string" && +currentNumber === number) {
    return true;
  } else {
    return false;
  }
};