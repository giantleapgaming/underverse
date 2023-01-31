import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { UpgradeModal } from "../modal/UpgradeModal";

const UpgradeSystem = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Level },
      api: { upgradeSystem },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { shouldUpgradeModal, showProgress },
      scenes: {
        Main: { input },
      },
      sounds,
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  if (selectedEntity) {
    const level = getComponentValue(Level, selectedEntity)?.value;
    const closeModal = () => {
      sounds["click"].play();
      shouldUpgradeModal(false);
      input.enabled.current = true;
    };
    const upgrade = async () => {
      if (selectedEntity) {
        sounds["confirm"].play();
        shouldUpgradeModal(false);
        input.enabled.current = true;
        showProgress();
        await upgradeSystem(world.entities[selectedEntity]);
      }
    };
    return <UpgradeModal upgradeSystem={upgrade} level={level && +level} close={closeModal} />;
  } else {
    return null;
  }
};

export const registerUpgrade = () => {
  registerUIComponent(
    "UpgradeSystem",
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
          components: { ShowUpgradeModal },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(ShowUpgradeModal.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          const showModal = getComponentValue(ShowUpgradeModal, modalIndex);
          if (userLinkWithAccount && showModal?.value) {
            return { layers };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <UpgradeSystem layers={layers} />;
    }
  );
};
