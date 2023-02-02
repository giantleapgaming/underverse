import { getComponentValue } from "@latticexyz/recs";
import { Layers } from "../../../../types";

export const FactionImg = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      components: { OwnedBy, Faction },
      world,
    },
    phaser: {
      localIds: { stationDetailsEntityIndex },
      components: { ShowStationDetails },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
    const factionIndex = world.entities.indexOf(ownedBy);
    const faction = getComponentValue(Faction, factionIndex)?.value;

    return (
      <img src={`/faction/${faction && +faction}.png`} width={"30px"} height={"30px"} style={{ marginTop: "-5px" }} />
    );
  } else {
    return null;
  }
};
