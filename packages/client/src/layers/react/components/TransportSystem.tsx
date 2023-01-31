import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { TransportModal } from "../modal/TransportModal";

const TransportSystem = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Position, Balance, Level },
      api: { transportSystem },
    },
    phaser: {
      components: { ShowStationDetails, Transport },
      localIds: { stationDetailsEntityIndex, modalIndex },
      localApi: { shouldTransport, showProgress },
      scenes: {
        Main: { input },
      },
      sounds,
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  const transport = getComponentValue(Transport, modalIndex);
  if (selectedEntity && transport?.showModal && transport?.entityId) {
    const position = getComponentValue(Position, selectedEntity);
    const balance = getComponentValue(Balance, selectedEntity)?.value;
    const destinationId = transport.entityId as EntityIndex;

    const destinationLevel = getComponentValue(Level, destinationId)?.value;
    const destinationPosition = getComponentValue(Position, destinationId);
    const destinationBalance = getComponentValue(Balance, destinationId)?.value;

    const distance =
      typeof position?.x === "number" && typeof destinationPosition?.x === "number"
        ? Math.sqrt(Math.pow(position?.x - destinationPosition.x, 2) + Math.pow(position?.y - destinationPosition.y, 2))
        : 1;
    const transportPrice = distance;
    const closeModal = () => {
      sounds["click"].play();
      shouldTransport(false, false, false);
      input.enabled.current = true;
    };
    const startTransport = async (kgs: number) => {
      if (selectedEntity) {
        sounds["ship-launching"].play();
        const sourceEntityId = world.entities[selectedEntity];
        const destinationEntityId = world.entities[transport.entityId as EntityIndex];
        shouldTransport(false, true, true, transport.entityId, kgs);
        await transportSystem(sourceEntityId, destinationEntityId, kgs);
        showProgress();
      }
    };
    return (
      <TransportModal
        startTransport={startTransport}
        close={closeModal}
        stock={
          destinationLevel &&
          balance &&
          destinationBalance &&
          (+balance > +destinationLevel - +destinationBalance ? +destinationLevel - +destinationBalance : +balance)
        }
        transportPrice={transportPrice}
        clickSound={() => {
          sounds["click"].play();
        }}
      />
    );
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
