import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { Modal } from "./Modal";

const BuyModal = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Position, Balance },
      api: { buySystem },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { shouldBuyModal, showProgress },
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  if (selectedEntity) {
    const position = getComponentValue(Position, selectedEntity);
    const balance = getComponentValue(Balance, selectedEntity)?.value;

    const distance =
      position?.x && typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
    const buyPrice = (10_000 / distance) * 1.1;
    const closeModal = () => {
      shouldBuyModal(false);
      input.enabled.current = true;
    };
    const buy = async (kgs: number) => {
      if (selectedEntity) {
        await buySystem(world.entities[selectedEntity], kgs);
        closeModal();
        showProgress();
      }
    };
    return <Modal buyPrice={buyPrice} buySystem={buy} stock={balance && +balance} close={closeModal} />;
  } else {
    return null;
  }
};

export const registerBuy = () => {
  registerUIComponent(
    "BuySystem",
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
          components: { ShowBuyModal },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(ShowBuyModal.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          const showModal = getComponentValue(ShowBuyModal, modalIndex);
          if (userLinkWithAccount && showModal?.value) {
            return { layers };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <BuyModal layers={layers} />;
    }
  );
};
