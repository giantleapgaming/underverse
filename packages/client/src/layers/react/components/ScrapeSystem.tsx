import { registerUIComponent } from "../engine";
import { EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { ScrapeModal } from "./modal/ScrapeModal";

const ScrapeSystem = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Level, Position, Balance, Defence },
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
  const defence = getComponentValue(Defence, selectedEntity)?.value;
  const position = getComponentValue(Position, selectedEntity);
  const level = getComponentValue(Level, selectedEntity)?.value;
  const balance = getComponentValue(Balance, selectedEntity)?.value;
  const distance = typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
  const build = 1_000_000 / distance;
  let levelCost = 0;
  for (let i = 2; i <= (level || 1); i++) {
    levelCost += Math.pow(i, 2) * 1_000;
  }
  const sellPrice = (100_000 / distance) * (balance || 0) * 0.9;
  const scrapPrice = (((sellPrice + levelCost + build) * (defence || 0)) / 100) * 0.25;
  if (selectedEntity) {
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
    return <ScrapeModal scrapeSystem={Scrap} close={closeModal} scrapPrice={scrapPrice} />;
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
