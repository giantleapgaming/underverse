import { getComponentValue } from "@latticexyz/recs";
import { PhaserLayer } from "../../../phaser";
import { NetworkLayer } from "../../types";

export function clickMove(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: { camera, input },
    },
    components: { ShowLine, ShowDestinationDetails, ShowStationDetails },
    localIds: { stationDetailsEntityIndex },
  } = phaser;

  input.pointermove$.subscribe(({ pointer }) => {
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const destinationDetails = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const sourceDetails = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    if (!lineDetails?.showLine || (destinationDetails && sourceDetails)) {
      if (pointer.leftButtonDown()) {
        camera.setScroll(
          camera.phaserCamera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.phaserCamera.zoom,
          camera.phaserCamera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.phaserCamera.zoom
        );
      }
    }
  });
}
