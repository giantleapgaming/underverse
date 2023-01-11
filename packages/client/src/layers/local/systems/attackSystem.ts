import { Assets, Sprites, Animations } from "../../phaser/constants";
import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, EntityID, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";

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
    components: { Position, OwnedBy },
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
        graphics.clear();
        graphics.lineStyle(2, 0xeeeeee, 1);
        const x1 = source.x + 32,
          y1 = source.y + 32,
          x2 = pointer.worldX,
          y2 = pointer.worldY; // coordinates of the start and end points
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
    shouldAttack(false, false, false);
  });

  world.registerDisposer(() => rightClick?.unsubscribe());
  defineComponentSystem(world, Attack, () => {
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const destinationDetails = getComponentValue(Attack, modalIndex);
    const destinationEntityId = destinationDetails?.entityId as EntityIndex;
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
          const blastObject = objectPool.get("explosion", "Sprite");
          const missileSprite = config.sprites[Sprites.Missile];
          const repeatLoop = destinationDetails.amount - 1;
          object.setComponent({
            id: "missileRelease",
            once: (gameObject) => {
              gameObject.setTexture(missileSprite.assetKey, missileSprite.frame);
              gameObject.setPosition(source.x, source.y);
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
                  blastObject.setComponent({
                    id: "explosionRelease",
                    once: (explosionObject) => {
                      console.log("repeat x");
                      explosionObject.setPosition(distraction.x, distraction.y);
                      explosionObject.play(Animations.Explosion);
                      sounds["explosion"].play();
                    },
                  });
                },
                onComplete: () => {
                  blastObject.setComponent({
                    id: "explosionRelease",
                    once: (explosionObject) => {
                      console.log("repeat x");
                      explosionObject.setPosition(distraction.x, distraction.y);
                      explosionObject.play(Animations.Explosion);
                      sounds["explosion"].play();
                      explosionObject.on(`animationcomplete-${Animations.Explosion}`, () => {
                        objectPool.remove("explosion");
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
