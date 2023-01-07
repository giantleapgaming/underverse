import { Sprites } from "../../phaser/constants";
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
      if (sourcePosition?.x && attackDetails?.showLine && !attackDetails?.showModal && !attackDetails.showAnimation) {
        const source = tileCoordToPixelCoord({ x: sourcePosition.x, y: sourcePosition.y }, tileWidth, tileHeight);
        graphics.clear();
        graphics.lineStyle(1, 0xffffff);
        graphics.moveTo(source.x + 32, source.y + 32);
        graphics.lineTo(pointer.worldX, pointer.worldY);
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

  defineComponentSystem(world, Attack, () => {
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const destinationDetails = getComponentValue(Attack, modalIndex);
    const destinationEntityId = destinationDetails?.entityId as EntityIndex;
    if (sourceEntityId && destinationEntityId && destinationEntityId !== sourceEntityId) {
      const sourcePosition = getComponentValue(Position, sourceEntityId);
      const attackCord = getComponentValue(AttackCords, modalIndex);
      if (sourcePosition?.x && attackCord?.y) {
        const source = tileCoordToPixelCoord({ x: sourcePosition.x, y: sourcePosition.y }, tileWidth, tileHeight);
        const distraction = tileCoordToPixelCoord({ x: attackCord.x, y: attackCord.y }, tileWidth, tileHeight);
        graphics.clear();
        graphics.lineStyle(1, 0xffffff);
        graphics.moveTo(source.x + 32, source.y + 32);
        graphics.lineTo(distraction.x + 32, distraction.y + 32);
        graphics.strokePath();
        const angle = Math.atan2(distraction.y - source.y, distraction.x - source.x) * (180 / Math.PI) + 90;

        if (
          destinationEntityId &&
          destinationDetails?.showAnimation &&
          !destinationDetails?.showModal &&
          destinationDetails.showLine &&
          destinationDetails?.amount
        ) {
          const object = objectPool.get("missile", "Sprite");
          const missileSprite = config.sprites[Sprites.Missile];
          object.setComponent({
            id: "missileRelease",
            once: (gameObject) => {
              gameObject.setTexture(missileSprite.assetKey, missileSprite.frame);
              gameObject.setAngle(angle);
              phaserScene.add.tween({
                targets: gameObject,
                x: {
                  from: source.x,
                  to: distraction.x + 32,
                },
                y: {
                  from: source.y,
                  to: distraction.y + 32,
                },
                repeat: 0,
                yoyo: false,
                duration: 10_000,
                onStart: () => {
                  graphics.clear();
                },
                onComplete: () => {
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
