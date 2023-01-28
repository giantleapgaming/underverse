import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { RepairModal } from "./modal/RepairModal";

const ScrapeSystem = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Level, Position, Balance, Defence },
      api: { repairSystem },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { shouldRepairModal },
      scenes: {
        Main: { input },
      },
      sounds,
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  const defence = getComponentValue(Defence, selectedEntity)?.value || 0;
  const position = getComponentValue(Position, selectedEntity);
  const level = getComponentValue(Level, selectedEntity)?.value;
  const distance = typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
  const build = 1_000_000 / distance;
  let levelCost = 0;
  for (let i = 2; i <= (level || 1); i++) {
    levelCost += Math.pow(i, 2) * 1_000;
  }
  const defenceLevel = level ? +level * 100 : 0;
  const damageTake = defenceLevel - +defence;
  const damagePer = (damageTake / defenceLevel) * 100;
  const repairPrice = ((build + levelCost) * damagePer) / 100;
  if (selectedEntity) {
    const closeModal = () => {
      sounds["click"].play();
      shouldRepairModal(false);
      input.enabled.current = true;
    };
    const Scrap = async () => {
      if (selectedEntity) {
        sounds["confirm"].play();
        shouldRepairModal(false);
        input.enabled.current = true;
        await repairSystem(world.entities[selectedEntity]);
      }
    };
    return <RepairModal repairSystem={Scrap} close={closeModal} repairPrice={repairPrice} />;
  } else {
    return null;
  }
};

export const registerRepair = () => {
  registerUIComponent(
    "RepairSystem",
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
          components: { ShowRepairModal },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(ShowRepairModal.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          const showModal = getComponentValue(ShowRepairModal, modalIndex);
          if (userLinkWithAccount && showModal?.value) {
            return { layers };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <ScrapeSystem layers={layers} />;
    }
  );
};
