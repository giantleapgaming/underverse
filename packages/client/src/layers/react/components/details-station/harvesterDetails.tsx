import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { getComponentValue, getComponentValueStrict, setComponent } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { repairPrice } from "../../utils/repairPrice";
import { scrapPrice } from "../../utils/scrapPrice";
import { Repair } from "../action-system/repair";
import { Scrap } from "../action-system/scrap";
import { Transport } from "../action-system/transport";
import { Upgrade } from "../action-system/upgrade";
import { Weapon } from "../action-system/weapon";
import { SelectButton } from "./Button";

export const HarvesterDetails = ({ layers }: { layers: Layers }) => {
  const [action, setAction] = useState("attack");
  const {
    phaser: {
      sounds,
      localApi: { setShowLine, setDestinationDetails, showProgress, setShowAnimation },
      components: { ShowStationDetails, ShowDestinationDetails },
      localIds: { stationDetailsEntityIndex },
      scenes: {
        Main: {
          maps: {
            Main: { tileWidth, tileHeight },
          },
        },
      },
    },
    network: {
      world,
      components: { EntityType, OwnedBy, Position, Balance, Level, Defence },
      api: { upgradeSystem, buyWeaponSystem, repairSystem, scrapeSystem, transportSystem },
      network: { connectedAddress },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    const ownedBy = getComponentValueStrict(OwnedBy, selectedEntity)?.value;
    const position = getComponentValueStrict(Position, selectedEntity);
    const balance = getComponentValueStrict(Balance, selectedEntity).value;
    const level = getComponentValueStrict(Level, selectedEntity).value;
    const defence = getComponentValueStrict(Defence, selectedEntity).value;
    // const fuel = getComponentValueStrict(Fuel, selectedEntity).value;
    const fuel = 0;
    const destinationDetails = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const destinationLevel = getComponentValue(Level, destinationDetails)?.value;
    const destinationBalance = getComponentValue(Balance, destinationDetails)?.value;
    const destinationPosition = getComponentValue(Position, destinationDetails);
    const isDestinationSelected =
      destinationDetails && typeof destinationPosition?.x === "number" && typeof destinationPosition?.y === "number";

    if (entityType && +entityType === Mapping.harvester.id) {
      return (
        <div>
          <S.Container>
            <S.Column>
              <S.Text>HARVESTER LVL {+level}</S.Text>
              <img src={`/build-stations/harvester.png`} width="100px" height="100px" />
              <S.Text>
                POSITION {position.x}/{position.x}
              </S.Text>
            </S.Column>
            <S.Column style={{ width: "325px" }}>
              <S.Row style={{ justifyContent: "space-around", width: "100%", gap: "20px" }}>
                <S.Weapon>
                  <img src="/build-stations/shied.png" />
                  <p>
                    {+defence}/{level && +level * 100}
                  </p>
                </S.Weapon>
                <S.Weapon>
                  <img src="/build-stations/box.png" />
                  <p>
                    {+balance}/{+level}
                  </p>
                </S.Weapon>
                <S.Weapon>
                  <img src="/build-stations/hydrogen.png" />
                  <p>{+fuel}</p>
                </S.Weapon>
              </S.Row>
              {ownedBy === connectedAddress.get() && (
                <S.Column style={{ width: "100%" }}>
                  {action === "upgrade" && (
                    <Upgrade
                      defence={+defence}
                      level={+level}
                      upgradeSystem={async () => {
                        try {
                          setAction("attack");
                          sounds["confirm"].play();
                          await upgradeSystem(world.entities[selectedEntity]);
                          showProgress();
                        } catch (e) {
                          setAction("upgrade");
                          console.log({ error: e, system: "Upgrade Attack", details: selectedEntity });
                        }
                      }}
                    />
                  )}
                  {action === "weapon" && (
                    <Weapon
                      offence={+balance}
                      defence={+defence}
                      level={+level}
                      buyWeaponSystem={async (kgs: number) => {
                        try {
                          setAction("attack");
                          sounds["confirm"].play();
                          await buyWeaponSystem(world.entities[selectedEntity], kgs);
                          showProgress();
                        } catch (e) {
                          setAction("weapon");
                          console.log({ error: e, system: "Weapon Attack", details: selectedEntity });
                        }
                      }}
                    />
                  )}
                  {action === "transport" && destinationDetails && isDestinationSelected && (
                    <Transport
                      space={
                        (destinationBalance && destinationLevel && balance - destinationLevel - +destinationBalance) ||
                        0
                      }
                      transport={async (weapons) => {
                        try {
                          sounds["confirm"].play();
                          await transportSystem(
                            world.entities[selectedEntity],
                            world.entities[destinationDetails],
                            weapons
                          );
                          const { x: destinationX, y: destinationY } = tileCoordToPixelCoord(
                            { x: destinationPosition.x, y: destinationPosition.y },
                            tileWidth,
                            tileHeight
                          );
                          const { x: sourceX, y: sourceY } = tileCoordToPixelCoord(
                            { x: position.x, y: position.y },
                            tileWidth,
                            tileHeight
                          );
                          setShowAnimation({
                            showAnimation: true,
                            amount: weapons,
                            destinationX,
                            destinationY,
                            sourceX,
                            sourceY,
                            type: "harvest",
                          });
                          setDestinationDetails();
                          setShowLine(false);
                          setAction("upgrade");
                          showProgress();
                        } catch (e) {
                          console.log({ error: e, system: "Fire Attack", details: selectedEntity });
                        }
                      }}
                      playSound={() => {
                        sounds["click"].play();
                      }}
                    />
                  )}
                  {action === "repair" && (
                    <Repair
                      defence={+defence}
                      level={+level}
                      repairCost={repairPrice(position.x, position.y, level, defence)}
                      repairSystem={async () => {
                        try {
                          setAction("attack");
                          sounds["confirm"].play();
                          await repairSystem(world.entities[selectedEntity]);
                          showProgress();
                        } catch (e) {
                          setAction("repair");
                          console.log({ error: e, system: "Repair Attack", details: selectedEntity });
                        }
                      }}
                    />
                  )}
                  {action === "scrap" && (
                    <Scrap
                      scrapCost={scrapPrice(position.x, position.y, level, defence, balance)}
                      scrapSystem={async () => {
                        try {
                          setAction("scrap");
                          sounds["confirm"].play();
                          await scrapeSystem(world.entities[selectedEntity]);
                          setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: undefined });
                          showProgress();
                        } catch (e) {
                          setAction("scrap");
                          console.log({ error: e, system: "Scrap Attack", details: selectedEntity });
                        }
                      }}
                    />
                  )}
                </S.Column>
              )}
            </S.Column>
            <div style={{ display: "flex", alignItems: "center", marginLeft: "5px", gap: "5px" }}>
              <S.Column>
                <S.Missiles>
                  <S.Img src="/layout/hex.png" width="40px" />
                </S.Missiles>
                <S.Missiles>
                  <S.Img src="/layout/hex.png" width="40px" />
                </S.Missiles>
                <S.Missiles>
                  <S.Img src="/layout/hex.png" width="40px" />
                </S.Missiles>
              </S.Column>
              <S.Column>
                <S.Missiles>
                  <S.Img src="/layout/hex.png" width="40px" />
                </S.Missiles>
                <S.Missiles>
                  <S.Img src="/layout/hex.png" width="40px" />
                </S.Missiles>
                <S.Missiles>
                  <S.Img src="/layout/hex.png" width="40px" />
                </S.Missiles>
              </S.Column>
            </div>
          </S.Container>
          <S.Row style={{ gap: "10px", marginTop: "5px" }}>
            <SelectButton
              name="TRANSPORT"
              isActive={action === "transport"}
              onClick={() => {
                setAction("transport");
                setShowLine(true, position.x, position.y, "transport");
                sounds["click"].play();
              }}
            />
            <SelectButton
              name="UPGRADE"
              isActive={action === "upgrade"}
              onClick={() => {
                setAction("upgrade");
                sounds["click"].play();
              }}
            />

            <SelectButton
              isActive={action === "repair"}
              name="REPAIR"
              onClick={() => {
                setAction("repair");
                sounds["click"].play();
              }}
            />
            <SelectButton
              isActive={action === "scrap"}
              name="SCRAP"
              onClick={() => {
                setAction("scrap");
                sounds["click"].play();
              }}
            />
            <SelectButton
              isActive={action === "move"}
              name="MOVE"
              onClick={() => {
                setAction("move");
                sounds["click"].play();
              }}
            />
          </S.Row>
        </div>
      );
    }
  }
  return null;
};

const S = {
  Container: styled.div`
    display: flex;
    position: relative;
    width: 100%;
    padding-top: 10px;
    padding-left: 10px;
  `,
  Text: styled.p`
    font-size: 10px;
    font-weight: 500;
    color: #ffffff;
    text-align: center;
  `,
  Column: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  `,
  Missiles: styled.div`
    height: 100%;
  `,
  Img: styled.img`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
  `,
  Weapon: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `,
  Slanted: styled.div<{ selected: boolean }>`
    position: relative;
    display: inline-block;
    padding: 1px;
    width: 20px;
    cursor: pointer;
    font-size: 12px;
    text-align: center;
    &::before {
      position: absolute;
      position: absolute;
      top: 0;
      left: -14%;
      width: 100%;
      height: 100%;
      content: "";
      border: ${({ selected }) => `1px solid ${selected ? "#de1312" : "#ffffff"}`};
      z-index: 4;
      width: 140%;
      transform: skewX(-20deg);
    }
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
  `,
  ButtonImg: styled.img`
    margin: auto;
    width: 100%;
  `,
};
