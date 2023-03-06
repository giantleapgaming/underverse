import { getComponentValue, getComponentValueStrict, setComponent } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { repairPrice } from "../../utils/repairPrice";
import { scrapPrice } from "../../utils/scrapPrice";
import { Repair } from "../action-system/repair";
import { Scrap } from "../action-system/scrap";
import { Upgrade } from "../action-system/upgrade";
import { Refuel } from "../action-system/refuel";
import { getNftId, isOwnedBy } from "../../../network/utils/getNftId";

export const ResidentialDetails = ({ layers }: { layers: Layers }) => {
  const [action, setAction] = useState("");
  const {
    phaser: {
      sounds,
      localApi: { setShowLine, showProgress, setDestinationDetails, setShowAnimation },
      components: { ShowStationDetails, ShowDestinationDetails },
      localIds: { stationDetailsEntityIndex },
    },
    network: {
      world,
      components: { EntityType, OwnedBy, Faction, Position, Level, Defence, Population, Fuel },
      api: { upgradeSystem, repairSystem, scrapeSystem, refuelSystem },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const isOwner = isOwnedBy(layers);
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    const ownedBy = getComponentValueStrict(OwnedBy, selectedEntity)?.value;
    const entityIndex = world.entities.indexOf(ownedBy);
    const factionNumber = getComponentValueStrict(Faction, entityIndex).value;
    const position = getComponentValueStrict(Position, selectedEntity);
    const population = getComponentValueStrict(Population, selectedEntity).value;
    const level = getComponentValueStrict(Level, selectedEntity).value;
    const defence = getComponentValueStrict(Defence, selectedEntity).value;
    const fuel = getComponentValueStrict(Fuel, selectedEntity).value;
    const destinationDetails = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const destinationPosition = getComponentValue(Position, destinationDetails);
    const destinationLevel = getComponentValue(Level, destinationDetails)?.value;
    const destinationFuel = getComponentValue(Fuel, destinationDetails)?.value;
    const destinationEntityType = getComponentValue(EntityType, destinationDetails)?.value;
    const isDestinationSelected =
      destinationDetails && typeof destinationPosition?.x === "number" && typeof destinationPosition?.y === "number";

    if (entityType && +entityType === Mapping.residential.id) {
      return (
        <div>
          <S.Container>
            <S.Column>
              <S.Text>RESIDENTIAL LVL {+level}</S.Text>
              <img src={`/build-stations/space-station.png`} width="100px" height="100px" />
              <S.Text>
                POSITION {position.x}/{position.y}
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
                  <img src="/build-stations/users.png" />
                  <p>
                    {+level}/{+population}
                  </p>
                </S.Weapon>
                <S.Weapon>
                  <img src="/build-stations/hydrogen.png" />
                  <p>
                    {Math.floor(+fuel / 10_00_000)}/{level * 1000}
                  </p>
                </S.Weapon>
              </S.Row>
              {isOwner && (
                <S.Column style={{ width: "100%" }}>
                  {action === "upgrade" && (
                    <Upgrade
                      defence={+defence}
                      level={+level}
                      upgradeSystem={async () => {
                        const nftDetails = getNftId(layers.network);
                        if (!nftDetails) {
                          return;
                        }
                        try {
                          setAction("");
                          sounds["confirm"].play();
                          showProgress();
                          const tx = await upgradeSystem(world.entities[selectedEntity], nftDetails.tokenId);
                          await tx.wait();
                        } catch (e) {
                          setAction("");
                          console.log({ error: e, system: "Upgrade Attack", details: selectedEntity });
                        }
                      }}
                      faction={+factionNumber}
                    />
                  )}

                  {action === "repair" && (
                    <Repair
                      defence={+defence}
                      level={+level}
                      repairCost={repairPrice(position.x, position.y, +level, +defence, +factionNumber)}
                      repairSystem={async () => {
                        const nftDetails = getNftId(layers.network);
                        if (!nftDetails) {
                          return;
                        }
                        try {
                          setAction("attack");
                          sounds["confirm"].play();
                          await repairSystem(world.entities[selectedEntity], nftDetails.tokenId);
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
                      scrapCost={scrapPrice(position.x, position.y, +level, +defence, +population, factionNumber)}
                      scrapSystem={async () => {
                        const nftDetails = getNftId(layers.network);
                        if (!nftDetails) {
                          return;
                        }
                        try {
                          setAction("scrap");
                          sounds["confirm"].play();
                          await scrapeSystem(world.entities[selectedEntity], nftDetails.tokenId);
                          setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: undefined });
                          showProgress();
                        } catch (e) {
                          setAction("scrap");
                          console.log({ error: e, system: "Scrap Attack", details: selectedEntity });
                        }
                      }}
                    />
                  )}
                  {action === "refuel" && destinationDetails && isDestinationSelected && (
                    <Refuel
                      space={
                        (destinationFuel &&
                        destinationLevel &&
                        +destinationLevel *
                          (typeof destinationEntityType !== "undefined" && +destinationEntityType == 9 ? 5000 : 1000) *
                          10_00_000 -
                          destinationFuel <
                          +fuel
                          ? destinationLevel *
                              (typeof destinationEntityType !== "undefined" && +destinationEntityType == 9
                                ? 5000
                                : 1000) *
                              10_00_000 -
                            destinationFuel
                          : +fuel) || 0
                      }
                      refuel={async (weapons) => {
                        const nftDetails = getNftId(layers.network);
                        if (!nftDetails) {
                          return;
                        }
                        try {
                          sounds["confirm"].play();
                          setDestinationDetails();
                          setShowLine(false);
                          setAction("");
                          showProgress();
                          await refuelSystem(
                            world.entities[selectedEntity],
                            world.entities[destinationDetails],
                            weapons,
                            nftDetails.tokenId
                          );
                          setShowAnimation({
                            showAnimation: true,
                            amount: weapons,
                            destinationX: destinationPosition.x,
                            destinationY: destinationPosition.y,
                            sourceX: position.x,
                            sourceY: position.y,
                            type: "fuelTransport",
                            entityID: destinationDetails,
                          });
                        } catch (e) {
                          console.log({ error: e, system: "Fire Attack", details: selectedEntity });
                        }
                      }}
                      playSound={() => {
                        sounds["click"].play();
                      }}
                    />
                  )}
                </S.Column>
              )}
            </S.Column>
            {isOwner && (
              <div style={{ display: "flex", alignItems: "center", marginLeft: "5px", gap: "5px" }}>
                <S.Column>
                  <S.SideButton
                    onClick={() => {
                      setAction("upgrade");
                      setShowLine(false);
                      sounds["click"].play();
                    }}
                  >
                    <S.Img
                      src={action === "upgrade" ? "/build-stations/upgrade-a.png" : "/build-stations/upgrade.png"}
                      width="40px"
                    />
                  </S.SideButton>
                  <S.SideButton
                    onClick={() => {
                      setAction("refuel");
                      setShowLine(true, position.x, position.y, "refuel");
                      sounds["click"].play();
                    }}
                  >
                    <S.Img
                      src={action === "refuel" ? "/build-stations/fuel-a.png" : "/build-stations/fuel.png"}
                      width="40px"
                    />
                  </S.SideButton>
                </S.Column>
                <S.Column>
                  <S.SideButton
                    onClick={() => {
                      setShowLine(false);
                      setAction("repair");
                      sounds["click"].play();
                    }}
                  >
                    <S.Img
                      src={action === "repair" ? "/build-stations/repair-a.png" : "/build-stations/repair.png"}
                      width="40px"
                    />
                  </S.SideButton>
                  <S.SideButton
                    onClick={() => {
                      setShowLine(false);
                      setAction("scrap");
                      sounds["click"].play();
                    }}
                  >
                    <S.Img
                      src={action === "scrap" ? "/build-stations/scrap-a.png" : "/build-stations/scrap.png"}
                      width="40px"
                    />
                  </S.SideButton>
                </S.Column>
              </div>
            )}
          </S.Container>
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
  SideButton: styled.div`
    height: 100%;
    cursor: pointer;
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
