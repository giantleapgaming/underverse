import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { TransportModal } from "./modal/TransportModal";

const TransportSystem = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Position, Balance },
      api: { transportSystem },
    },
    phaser: {
      components: { ShowStationDetails, Transport },
      localIds: { stationDetailsEntityIndex, modalIndex },
      localApi: { shouldTransport, showProgress },
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  const transport = getComponentValue(Transport, modalIndex);
  if (selectedEntity && transport?.showModal && transport?.entityId) {
    const position = getComponentValue(Position, selectedEntity);
    const balance = getComponentValue(Balance, selectedEntity)?.value;

    const distance =
      position?.x && typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
    const sellPrice = (100_000 / distance) * 0.9;
    const closeModal = () => {
      shouldTransport(false, false, undefined);
      input.enabled.current = true;
    };
    const startTransport = async (kgs: number) => {
      if (selectedEntity) {
        const sourceEntityId = world.entities[selectedEntity];
        const destinationEntityId = world.entities[transport.entityId as EntityIndex];
        await transportSystem(sourceEntityId, destinationEntityId, kgs);
        closeModal();
        showProgress();
      }
    };
    return <TransportModal startTransport={startTransport} close={closeModal} stock={balance && +balance} />;
  } else {
    return null;
  }
};

export const registerTransport = () => {
  registerUIComponent(
    "TransportSystem",
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
          components: { Transport },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(Transport.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          const transport = getComponentValue(Transport, modalIndex);
          if (userLinkWithAccount && transport?.showModal) {
            return { layers };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <TransportSystem layers={layers} />;
    }
  );
};
