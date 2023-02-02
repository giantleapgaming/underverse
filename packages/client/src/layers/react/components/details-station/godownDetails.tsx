import { getComponentValue } from "@latticexyz/recs";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";

export const GodownDetails = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
    },
    network: {
      components: { EntityType },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const entityType = getComponentValue(EntityType, selectedEntity)?.value;
    if (entityType && +entityType === Mapping.godown.id) {
      return (
        <div>
          <div>Godown Details</div>
        </div>
      );
    }
  }
  return null;
};
