import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Layers } from "../../../../types";

export const FactionImg = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      components: { Faction, OwnedBy },
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
    if (ownedBy) {
      const faction = getComponentValueStrict(Faction, world.entities.indexOf(ownedBy))?.value;
      return <img src={`/faction/${+faction}.png`} width={"30px"} height={"30px"} style={{ marginTop: "-5px" }} />;
    } else {
      return null;
    }
  }
};
