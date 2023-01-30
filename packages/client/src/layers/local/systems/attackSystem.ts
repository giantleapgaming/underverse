import { Sprites, Animations } from "../../phaser/constants";
import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, EntityID, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { enclosedPoints, getCoordinatesArray, intersectingCircles } from "../../../utils/distance";

const stationColor = [Sprites.View1, Sprites.View2, Sprites.View3, Sprites.View4, Sprites.View5, Sprites.View6];

export function attackSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        input,
        phaserScene,
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Attack, ShowStationDetails, AttackCords },
    localApi: { shouldAttack, setAttackCords },
    localIds: { modalIndex, stationDetailsEntityIndex },
    sounds,
  } = phaser;
  const {
    utils: { getEntityIndexAtPosition },
    network: { connectedAddress },
    components: { Position, OwnedBy, Level, Faction },
  } = network;
  const graphics = phaserScene.add.graphics();
  graphics.lineStyle(1, 0xffffff, 1);

  const lineSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    if (sourceEntityId) {
      const sourcePosition = getComponentValue(Position, sourceEntityId);
      const attackDetails = getComponentValue(Attack, modalIndex);
      if (
        typeof sourcePosition?.x == "number" &&
        attackDetails?.showLine &&
        !attackDetails?.showModal &&
        !attackDetails.showAnimation
      ) {
        const source = tileCoordToPixelCoord({ x: sourcePosition.x, y: sourcePosition.y }, tileWidth, tileHeight);
        const destitution = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
        graphics.clear();
        graphics.lineStyle(2, 0xeeeeee, 1);
        const x1 = source.x + 32,
          y1 = source.y + 32,
          x2 = pointer.worldX,
          y2 = pointer.worldY; // coordinates of the start and end points
        const valuesX = Position.values.x;
        const valuesY = Position.values.y;
        const allCoordinates = getCoordinatesArray(valuesX, valuesY);

        const possibleBlockingStations = enclosedPoints(allCoordinates, [
          [sourcePosition.x, sourcePosition.y],
          [destitution.x, destitution.y],
        ]);

        const blockingStations = intersectingCircles(
          possibleBlockingStations,
          [sourcePosition.x, sourcePosition.y],
          [destitution.x, destitution.y]
        );

        for (let i = 0; i < blockingStations.length; i++) {
          const blockingStation = blockingStations[i];
          const blockingStationEntity = getEntityIndexAtPosition(blockingStation[0], blockingStation[1]);
          const ownedBy = getComponentValue(OwnedBy, blockingStationEntity)?.value as EntityID;
          const getLevel = getComponentValue(Level, blockingStationEntity)?.value as EntityID;
          const userEntityId = connectedAddress.get();
          if (userEntityId !== ownedBy && getLevel > 0) {
            const showBLockingCord = tileCoordToPixelCoord(
              { x: blockingStation[0], y: blockingStation[1] },
              tileWidth,
              tileHeight
            );
            const object = objectPool.get(`blocking-station-attack-${i}`, "Sprite");
            const factionIndex = world.entities.indexOf(ownedBy);
            const faction = getComponentValue(Faction, factionIndex)?.value;
            const Sprite = stationColor[faction ? +faction - 1 : 1] as Sprites.View1;
            const stationBackground = config.sprites[Sprite];
            object.setComponent({
              id: `blocking-station-attack-${i}`,
              once: (gameObject) => {
                gameObject.setTexture(stationBackground.assetKey, stationBackground.frame);
                gameObject.setPosition(showBLockingCord.x + 32, showBLockingCord.y + 32);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.depth = 2;
                gameObject.setAngle(0);
              },
            });
          } else {
            objectPool.remove(`blocking-station-attack-${i}`);
          }
        }
        const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); // length of the line
        const dotSize = 4; // size of the dots in pixels
        const gapSize = 8; // size of the gaps between dots in pixels
        const angle = Math.atan2(y2 - y1, x2 - x1);
        graphics.moveTo(x1, y1);
        for (let i = 0; i < lineLength; i += dotSize + gapSize) {
          graphics.lineTo(x1 + i * Math.cos(angle), y1 + i * Math.sin(angle));
          graphics.moveTo(x1 + (i + dotSize) * Math.cos(angle), y1 + (i + dotSize) * Math.sin(angle));
        }
        graphics.lineTo(x2, y2);
        graphics.strokePath();
      }
    }
  });
  world.registerDisposer(() => lineSub?.unsubscribe());

  const click = input.click$.subscribe((p) => {
    const pointer = p;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    const attackDetails = getComponentValue(Attack, modalIndex);
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    if (attackDetails?.showLine && !attackDetails?.showModal && sourceEntityId && stationEntity) {
      const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value as EntityID;
      const walletAddress = connectedAddress.get();
      if (walletAddress !== ownedBy) {
        setAttackCords(x, y);
        shouldAttack(true, false, false, stationEntity);
      }
    }
  });

  world.registerDisposer(() => click?.unsubscribe());
  const rightClick = input.rightClick$.subscribe(() => {
    const pointer = phaserScene.input.activePointer;
    const destitution = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const valuesX = Position.values.x;
    const valuesY = Position.values.y;
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const allCoordinates = getCoordinatesArray(valuesX, valuesY);
    const sourcePosition = getComponentValue(Position, sourceEntityId);
    if (typeof sourcePosition?.x === "number") {
      const possibleBlockingStations = enclosedPoints(allCoordinates, [
        [sourcePosition.x, sourcePosition.y],
        [destitution.x, destitution.y],
      ]);

      const blockingStations = intersectingCircles(
        possibleBlockingStations,
        [sourcePosition.x, sourcePosition.y],
        [destitution.x, destitution.y]
      );
      for (let i = 0; i < blockingStations.length; i++) {
        objectPool.remove(`blocking-station-attack-${i}`);
      }
    }
    shouldAttack(false, false, false);
  });

  world.registerDisposer(() => rightClick?.unsubscribe());
  defineComponentSystem(world, Attack, () => {
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const destinationDetails = getComponentValue(Attack, modalIndex);
    const destinationEntityId = destinationDetails?.entityId as EntityIndex;
    const wallet = connectedAddress.get();
    const factionIndex = world.entities.indexOf(wallet);
    const faction = getComponentValue(Faction, factionIndex)?.value;
    if (sourceEntityId && destinationEntityId && destinationEntityId !== sourceEntityId) {
      const sourcePosition = getComponentValue(Position, sourceEntityId);
      const attackCord = getComponentValue(AttackCords, modalIndex);
      if (typeof sourcePosition?.x == "number" && typeof attackCord?.y == "number") {
        const source = tileCoordToPixelCoord({ x: sourcePosition.x, y: sourcePosition.y }, tileWidth, tileHeight);
        const distraction = tileCoordToPixelCoord({ x: attackCord.x, y: attackCord.y }, tileWidth, tileHeight);
        graphics.clear();
        const angle = Math.atan2(distraction.y - source.y, distraction.x - source.x) * (180 / Math.PI);
        if (
          destinationEntityId &&
          destinationDetails?.showAnimation &&
          !destinationDetails?.showModal &&
          destinationDetails?.showLine &&
          destinationDetails?.amount
        ) {
          const object = objectPool.get("missile", "Sprite");
          const missileSprite = config.sprites[Sprites.Missile2];
          const repeatLoop = destinationDetails.amount - 1;
          object.setComponent({
            id: "missileRelease",
            once: (gameObject) => {
              gameObject.setTexture(missileSprite.assetKey, `missile-${faction && +faction}.png`);
              gameObject.setPosition(source.x + 32, source.y + 32);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
              phaserScene.add.tween({
                targets: gameObject,
                x: {
                  from: gameObject.x,
                  to: distraction.x + 32,
                },
                y: {
                  from: gameObject.y,
                  to: distraction.y + 32,
                },
                repeat: repeatLoop,
                yoyo: false,
                duration: 2_000,
                onStart: () => {
                  graphics.clear();
                },
                onRepeat: () => {
                  sounds["missile-launch"].play();
                  const blastObject = objectPool.get("explosion", "Sprite");
                  blastObject.setComponent({
                    id: "explosionRelease",
                    once: (explosionObject) => {
                      explosionObject.setPosition(distraction.x + 36, distraction.y + 16);
                      explosionObject.setOrigin(0.5, 0.5);
                      explosionObject.play(Animations.Explosion);
                      sounds["explosion"].play();
                    },
                  });
                },
                onComplete: () => {
                  const blastObject = objectPool.get("explosion-end", "Sprite");
                  blastObject.setComponent({
                    id: "explosionRelease",
                    once: (explosionObject) => {
                      explosionObject.setPosition(distraction.x + 36, distraction.y + 16);
                      explosionObject.setOrigin(0.5, 0.5);
                      explosionObject.play(Animations.Explosion);
                      sounds["explosion"].play();
                      explosionObject.on(`animationcomplete-${Animations.Explosion}`, () => {
                        objectPool.remove("explosion");
                        objectPool.remove("explosion-end");
                      });
                    },
                  });
                  objectPool.remove("missile");
                  shouldAttack(false, false, false);
                  input.enabled.current = true;
                },
              });
            },
          });
        }
      }
    }
    if (
      !destinationDetails?.showLine &&
      !destinationDetails?.showModal &&
      !destinationDetails?.showAnimation &&
      !destinationDetails?.entityId &&
      !destinationDetails?.amount
    ) {
      graphics.clear();
    }
  });
}
