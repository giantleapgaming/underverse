import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { AttackModal } from "./modal/AttackModal";

const AttackSystem = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Position, Offence },
      api: { attackSystem },
    },
    phaser: {
      components: { ShowStationDetails, Attack },
      localIds: { stationDetailsEntityIndex, modalIndex },
      localApi: { shouldAttack, showProgress },
      scenes: {
        Main: { input },
      },
      sounds,
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  const attack = getComponentValue(Attack, modalIndex);
  if (selectedEntity && attack?.showModal && attack.entityId) {
    const position = getComponentValue(Position, selectedEntity);
    const designationIndex = attack.entityId as EntityIndex;
    const destination = getComponentValue(Position, designationIndex);

    const offence = getComponentValue(Offence, selectedEntity)?.value;
    const distance =
      typeof position?.x === "number" && typeof destination?.x === "number"
        ? Math.sqrt(Math.pow(destination.x - position.x, 2) + Math.pow(destination.y - position.y, 2))
        : 1;
    const closeModal = () => {
      sounds["click"].play();
      shouldAttack(false, false, false);
      input.enabled.current = true;
    };
    const startAttack = async (kgs: number) => {
      if (selectedEntity) {
        sounds["missile-launch"].play();
        const sourceEntityId = world.entities[selectedEntity];
        const destinationEntityId = world.entities[attack.entityId as EntityIndex];
        shouldAttack(false, true, true, attack.entityId, kgs);
        await attackSystem(sourceEntityId, destinationEntityId, kgs);
        showProgress();
      }
    };
    return (
      <AttackModal
        startAttack={startAttack}
        stock={offence && +offence}
        distance={distance}
        close={closeModal}
        clickSound={() => {
          sounds["click"].play();
        }}
      />
    );
  } else {
    return null;
  }
};

export const registerAttackDetails = () => {
  registerUIComponent(
    "AttackSystem",
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
          components: { Attack },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(Attack.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          const showModal = getComponentValue(Attack, modalIndex)?.showModal;
          if (userLinkWithAccount && showModal) {
            return { layers };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <AttackSystem layers={layers} />;
    }
  );
};
