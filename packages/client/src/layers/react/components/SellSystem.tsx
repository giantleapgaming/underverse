import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { SellModal } from "./modal/SellModal";

const SellSystem = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Position, Balance },
      api: { sellSystem },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { shouldSellModal, showProgress },
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  if (selectedEntity) {
    const position = getComponentValue(Position, selectedEntity);
    const balance = getComponentValue(Balance, selectedEntity)?.value;

    const distance = typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
    const sellPrice = (100_000 / distance) * 0.9;
    const closeModal = () => {
      shouldSellModal(false);
      input.enabled.current = true;
    };
    const sell = async (kgs: number) => {
      if (selectedEntity) {
        await sellSystem(world.entities[selectedEntity], kgs);
        closeModal();
        showProgress();
      }
    };
    return <SellModal sellPrice={sellPrice} sellSystem={sell} stock={balance && +balance} close={closeModal} />;
  } else {
    return null;
  }
};

export const registerSell = () => {
  registerUIComponent(
    "SellSystem",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Name },
          world,
        },
        phaser: {
          components: { ShowSellModal },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(ShowSellModal.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          const showModal = getComponentValue(ShowSellModal, modalIndex);
          if (userLinkWithAccount && showModal?.value) {
            return { layers };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <SellSystem layers={layers} />;
    }
  );
};
