import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentEntities, getComponentValue, setComponent } from "@latticexyz/recs";
import { get3x3Grid } from "../../../utils/get3X3Grid";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
export function createDrawHoverIconSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { HoverIcon },
    scenes: {
      Main: {
        input,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    localIds: { selectId },
  } = phaser;
  const {
    network: { connectedAddress },
    components: { Name, Position },
  } = network;
  const pointer = [
    "url(/station/1-1.png), pointer",
    "url(/station/2-1.png), pointer",
    "url(/station/3-1.png), pointer",
    "url(/station/4-1.png), pointer",
    "url(/station/5-1.png), pointer",
    "url(/station/6-1.png), pointer ",
  ];
  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const isBuild = getComponentValue(HoverIcon, selectId)?.value;
    if (isBuild && isBuild !== "hide") {
      const allPositionEntity = [...getComponentEntities(Position)];
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const checkIfWeCanMakeAmove = allPositionEntity.find((entity) => {
        const cord = getComponentValue(Position, entity);
        if (cord) {
          const grid = get3x3Grid(cord.x, cord.y);
          const flatGrid = grid.flat();
          return flatGrid.find(([xCoord, yCoord]) => xCoord === x && yCoord === y) ? true : false;
        }
      });
      if (checkIfWeCanMakeAmove) {
        setComponent(HoverIcon, selectId, { value: "pointer" });
      } else {
        setComponent(HoverIcon, selectId, { value: "show" });
      }
    }
  });
  world.registerDisposer(() => hoverSub?.unsubscribe());
  const rightClickSub = input.rightClick$.subscribe(() => {
    setComponent(HoverIcon, selectId, { value: "hide" });
  });

  world.registerDisposer(() => rightClickSub?.unsubscribe());
  defineComponentSystem(world, HoverIcon, ({ value }) => {
    const cursorIcon = value[0]?.value;
    if (cursorIcon === "hide") {
      input.setCursor("pointer");
    } else {
      if (cursorIcon === "pointer") {
        input.setCursor(cursorIcon);
        return;
      }
      const userHoverStation = {} as { [key: string]: string };
      [...getComponentEntities(Name)].map(
        (nameEntity, index) => (userHoverStation[world.entities[nameEntity]] = pointer[index])
      );
      const address = connectedAddress.get();
      const string = address ? userHoverStation[address] : "url(/station/1-1.png), pointer";
      input.setCursor(string);
    }
  });
}
