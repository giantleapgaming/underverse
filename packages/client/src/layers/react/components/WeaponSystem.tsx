import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { WeaponModal } from "./modal/WeaponModal";

const WeaponSystem = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Position, Offence },
      api: { buyWeaponSystem },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { shouldShowWeaponModal, showProgress },
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  if (selectedEntity) {
    const position = getComponentValue(Position, selectedEntity);
    const offence = getComponentValue(Offence, selectedEntity)?.value;

    const distance =
      position?.x && typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
    const buyPrice = (100_000 / distance) * 1.1;

    const closeModal = () => {
      shouldShowWeaponModal(false);
      input.enabled.current = true;
    };

    const buy = async (kgs: number) => {
      if (selectedEntity) {
        await buyWeaponSystem(world.entities[selectedEntity], kgs);
        closeModal();
        showProgress();
      }
    };
    return <WeaponModal buyPrice={buyPrice} buySystem={buy} stock={offence && +offence} close={closeModal} />;
  } else {
    return null;
  }
};

export const registerWeaponDetails = () => {
  registerUIComponent(
    "WeaponSystem",
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
          components: { showWeaponModal },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(showWeaponModal.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          const showModal = getComponentValue(showWeaponModal, modalIndex)?.showModal;
          if (userLinkWithAccount && showModal) {
            return { layers };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <WeaponSystem layers={layers} />;
    }
  );
};
