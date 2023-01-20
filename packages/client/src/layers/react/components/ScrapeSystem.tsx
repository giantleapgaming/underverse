import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { ScrapeModal } from "./modal/ScrapeModal";

const ScrapeSystem = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Level },
      api: { scrapeSystem },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { shouldScrapeModal },
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
      shouldScrapeModal(false);
      input.enabled.current = true;
    };
    const Scrap = async () => {
      if (selectedEntity) {
        sounds["confirm"].play();
        shouldScrapeModal(false);
        input.enabled.current = true;
        await scrapeSystem(world.entities[selectedEntity]);
      }
    };
    return <ScrapeModal scrapeSystem={Scrap} close={closeModal} />;
  } else {
    return null;
  }
};

export const registerScrap = () => {
  registerUIComponent(
    "ScrapSystem",
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
          components: { ShowScrapeModal },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(ShowScrapeModal.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          const showModal = getComponentValue(ShowScrapeModal, modalIndex);
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
