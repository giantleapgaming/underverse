import styled from "styled-components";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Layers } from "../../../../types";
import { factionData } from "../../../../utils/constants";
import { Mapping } from "../../../../utils/mapping";
import { getNftId, isOwnedByIndex } from "../../../network/utils/getNftId";
import { useEthBalance } from "../../hooks/useEthBalance";
import { toast } from "sonner";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { useState } from "react";

export const Highlight = ({ layers }: { layers: Layers }) => {
  const [showActionName, setShowActionName] = useState({
    cog: false,
    centerMap: false,
    harvester: false,
    attack: false,
    passenger: false,
  });
  const {
    network: {
      world,
      components: { Name, Cash, Faction, Population, OwnedBy, Position, EntityType, Defence, NFTID, Level },
      network: { connectedAddress },
    },
    phaser: {
      localIds: { showCircleIndex, stationDetailsEntityIndex },
      localApi: { shouldShowCircle, setShowHighLight, setShowStationDetails },
      components: { ShowCircle, ShowHighLight, ShowStationDetails },
      scenes: {
        Main: {
          camera,
          input,
          maps: {
            Main: { tileWidth, tileHeight },
          },
        },
      },
      sounds,
    },
  } = layers;
  const selectedEntities = getComponentValue(ShowCircle, showCircleIndex)?.selectedEntities ?? [];

  const nftDetails = getNftId(layers);
  const allUserNameEntityId = [...getComponentEntities(Name)]
    .sort((prevEntity, presentEntity) => {
      const preCash = getComponentValue(Cash, prevEntity)?.value;
      const presentCash = getComponentValue(Cash, presentEntity)?.value;
      return preCash && presentCash ? +presentCash - +preCash : 0;
    })
    .sort((prevEntity, presentEntity) => {
      let preTotalPopulation = 0;
      let presentTotalPopulation = 0;
      [...getComponentEntities(Position)].forEach((entity) => {
        const entityType = getComponentValue(EntityType, entity)?.value;
        const ownedByEntityId = getComponentValue(OwnedBy, entity)?.value;
        const positionOwnedByIndex = world.entities.indexOf(ownedByEntityId);
        if (entityType && +entityType === Mapping.residential.id && prevEntity && prevEntity === positionOwnedByIndex) {
          const defence = getComponentValue(Defence, entity)?.value;
          const prePopulation = getComponentValue(Population, entity)?.value;
          const level = getComponentValue(Level, entity)?.value;
          if (prePopulation && defence && +defence > 0 && level && +level > 0) {
            preTotalPopulation += +prePopulation;
          }
        }
        if (
          entityType &&
          +entityType === Mapping.residential.id &&
          presentEntity &&
          presentEntity === positionOwnedByIndex
        ) {
          const defence = getComponentValue(Defence, entity)?.value;
          const presentPopulation = getComponentValue(Population, entity)?.value;
          if (presentPopulation && defence) {
            presentTotalPopulation += +presentPopulation;
          }
        }
      });
      return presentTotalPopulation - preTotalPopulation;
    });

  const showDetails = getComponentValue(ShowHighLight, stationDetailsEntityIndex)?.value;

  if (typeof nftDetails?.tokenId === "number") {
    const { balance } = useEthBalance(connectedAddress.get());
    return (
      <S.Container>
        {showDetails && (
          <S.DetailsContainer>
            <img
              src="/ui/CogButtonMenu.png"
              onMouseEnter={() => {
                input.disableInput();
              }}
              onMouseLeave={() => {
                input.enableInput();
              }}
            />
            <S.HighLight
              onMouseEnter={() => {
                input.disableInput();
              }}
              onMouseLeave={() => {
                input.enableInput();
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "35px" }}>
                <p>LEADERBOARD</p>
                <a
                  target="_blank"
                  href={"https://giantleap-test.calderaexplorer.xyz/address/" + connectedAddress.get()}
                  style={{
                    border: "1px solid #5AE7D2",
                    borderRadius: "10%",
                    padding: "8px",
                    fontSize: "13px",
                    color: "#5AE7D2",
                    textDecoration: "none",
                  }}
                >
                  WALLET <br />
                  Gas <span>{Math.floor(+balance)}</span>
                </a>
              </div>
            </S.HighLight>
            <S.List
              onMouseEnter={() => {
                input.disableInput();
              }}
              onMouseLeave={() => {
                input.enableInput();
              }}
            >
              {allUserNameEntityId.map((nameEntity) => {
                let totalPopulation = 0;
                const name = getComponentValue(Name, nameEntity);
                const cash = getComponentValue(Cash, nameEntity)?.value;
                const nftId = getComponentValue(NFTID, nameEntity)?.value;
                const owner = !!(nftId && nftDetails.tokenId === +nftId);
                const indexOf = selectedEntities.indexOf(nameEntity);
                const exists = selectedEntities.some((entity: any) => entity === nameEntity);
                const factionNumber = getComponentValue(Faction, nameEntity)?.value;
                const faction = factionData.find((f) => f.factionNumber === (factionNumber && +factionNumber));
                [...getComponentEntities(Position)].forEach((entity) => {
                  const entityType = getComponentValue(EntityType, entity)?.value;
                  const OwnedByEntityId = getComponentValue(OwnedBy, entity)?.value;
                  const positionOwnedByIndex = world.entities.indexOf(OwnedByEntityId);
                  if (
                    entityType &&
                    +entityType === Mapping.residential.id &&
                    nameEntity &&
                    nameEntity === positionOwnedByIndex
                  ) {
                    const population = getComponentValue(Population, entity)?.value;
                    const defence = getComponentValue(Defence, entity)?.value;
                    const level = getComponentValue(Level, entity)?.value;
                    if (population && defence && +defence > 0 && level && +level > 0) {
                      totalPopulation += +population;
                    }
                  }
                });
                return (
                  <div key={nameEntity} style={{ height: "40px" }}>
                    <S.Player>
                      <S.CheckBox
                        type="checkbox"
                        owned={owner}
                        className={exists ? "checked" : ""}
                        checked={exists}
                        onChange={() => {
                          if (!exists) {
                            const list = [...selectedEntities, nameEntity];
                            shouldShowCircle(list);
                          } else {
                            const newList = [...selectedEntities];
                            newList.splice(indexOf, 1);
                            shouldShowCircle(newList);
                          }
                        }}
                      />
                      <S.PLayerName style={{ color: owner ? "#33ff00" : faction?.color }}>
                        {owner ? "ME" : name?.value.slice(0, 13)}
                        <br />
                        <S.Cash style={{ color: owner ? "#33ff00" : faction?.color }}>
                          {cash &&
                            new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(+cash / 1_000_000)}
                          <span>
                            <img
                              src="/build-stations/users.png"
                              style={{ height: "13px", width: "18px", margin: " 0 8px" }}
                            />
                            <u>{totalPopulation}</u>
                          </span>
                        </S.Cash>
                      </S.PLayerName>
                    </S.Player>
                  </div>
                );
              })}
            </S.List>
          </S.DetailsContainer>
        )}
        <S.ActionButtons>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "flex-start",
              gap: "15px",
            }}
          >
            {showActionName.cog && <p>LEADERBOARD</p>}
            <img
              style={{ zIndex: 10, cursor: "pointer", pointerEvents: "fill" }}
              src="/ui/Cog.png"
              width={"30px"}
              height={"30px"}
              onMouseEnter={() => {
                input.disableInput();
                setShowActionName({ ...showActionName, cog: true });
              }}
              onMouseLeave={() => {
                input.enableInput();
                setShowActionName({ ...showActionName, cog: false });
              }}
              onClick={() => {
                sounds["click"].play();
                setShowHighLight(!showDetails);
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "15px",
            }}
          >
            {showActionName.centerMap && <p>CENTER MAP</p>}
            <img
              width={"30px"}
              height={"30px"}
              style={{ zIndex: 10, cursor: "pointer", pointerEvents: "fill" }}
              src="/ui/recenter.png"
              onMouseEnter={() => {
                input.disableInput();
                setShowActionName({ ...showActionName, centerMap: true });
              }}
              onMouseLeave={() => {
                input.enableInput();
                setShowActionName({ ...showActionName, centerMap: false });
              }}
              onClick={() => {
                sounds["click"].play();
                camera.centerOn(0, -1);
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "15px",
            }}
          >
            {showActionName.harvester && <p>HARVESTER</p>}

            <img
              width={"30px"}
              height={"30px"}
              style={{ zIndex: 10, cursor: "pointer", pointerEvents: "fill" }}
              src="/ui/harvester.png"
              onMouseEnter={() => {
                input.disableInput();
                setShowActionName({ ...showActionName, harvester: true });
              }}
              onMouseLeave={() => {
                input.enableInput();
                setShowActionName({ ...showActionName, harvester: false });
              }}
              onClick={() => {
                sounds["click"].play();
                const allHarvesterEntities = [...getComponentEntities(Position)].filter((entity) => {
                  const entityType = getComponentValue(EntityType, entity)?.value;
                  const isOwner = isOwnedByIndex(layers, entity);
                  const defence = getComponentValue(Defence, entity)?.value;
                  const level = getComponentValueStrict(Level, entity)?.value;

                  return (
                    defence && entityType && isOwner && +entityType === Mapping.harvester.id && +defence && +level > 0
                  );
                });
                const totalHarvesterEntities = allHarvesterEntities.length;
                if (totalHarvesterEntities) {
                  const selectedStationEntity = getComponentValue(
                    ShowStationDetails,
                    stationDetailsEntityIndex
                  )?.entityId;
                  if (selectedStationEntity) {
                    const entityType = getComponentValue(EntityType, selectedStationEntity)?.value;
                    if (entityType && +entityType === Mapping.harvester.id) {
                      const index = allHarvesterEntities.indexOf(selectedStationEntity);
                      if (!(index === totalHarvesterEntities - 1)) {
                        const defence = getComponentValue(Defence, allHarvesterEntities[index + 1]);
                        const position = getComponentValue(Position, allHarvesterEntities[index + 1]);
                        if (defence && defence.value > 0) {
                          setShowStationDetails(allHarvesterEntities[index + 1]);
                          if (position) {
                            const { x, y } = tileCoordToPixelCoord(
                              { x: position.x, y: position.y },
                              tileWidth,
                              tileHeight
                            );
                            camera.setScroll(x, y);
                          }
                        }
                        return;
                      }
                    }
                  }
                  const defence = getComponentValue(Defence, allHarvesterEntities[0]);
                  const position = getComponentValue(Position, allHarvesterEntities[0]);
                  setShowStationDetails(allHarvesterEntities[0]);
                  if (position && defence && +defence.value > 0) {
                    const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
                    camera.setScroll(x, y);
                  }
                } else {
                  toast.error("You don't have any Harvester, Please build one");
                }
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "15px",
            }}
          >
            {showActionName.attack && <p>ATTACK SHIP</p>}

            <img
              width={"30px"}
              height={"30px"}
              style={{ zIndex: 10, cursor: "pointer", pointerEvents: "fill" }}
              src="/ui/attack.png"
              onMouseEnter={() => {
                input.disableInput();
                setShowActionName({ ...showActionName, attack: true });
              }}
              onMouseLeave={() => {
                input.enableInput();
                setShowActionName({
                  ...showActionName,
                  attack: false,
                });
              }}
              onClick={() => {
                sounds["click"].play();
                const allAttackEntities = [...getComponentEntities(Position)].filter((entity) => {
                  const entityType = getComponentValue(EntityType, entity)?.value;
                  const isOwner = isOwnedByIndex(layers, entity);
                  const defence = getComponentValue(Defence, entity)?.value;
                  const level = getComponentValueStrict(Level, entity)?.value;

                  return (
                    defence && entityType && isOwner && +entityType === Mapping.attack.id && +defence && +level > 0
                  );
                });
                const totalAttackEntities = allAttackEntities.length;
                if (totalAttackEntities) {
                  const selectedStationEntity = getComponentValue(
                    ShowStationDetails,
                    stationDetailsEntityIndex
                  )?.entityId;
                  if (selectedStationEntity) {
                    const entityType = getComponentValue(EntityType, selectedStationEntity)?.value;
                    if (entityType && +entityType === Mapping.attack.id) {
                      const index = allAttackEntities.indexOf(selectedStationEntity);
                      if (!(index === totalAttackEntities - 1)) {
                        const defence = getComponentValue(Defence, allAttackEntities[index + 1]);
                        const position = getComponentValue(Position, allAttackEntities[index + 1]);
                        if (defence && defence.value > 0) {
                          setShowStationDetails(allAttackEntities[index + 1]);
                          if (position) {
                            const { x, y } = tileCoordToPixelCoord(
                              { x: position.x, y: position.y },
                              tileWidth,
                              tileHeight
                            );
                            camera.setScroll(x, y);
                          }
                        }
                        return;
                      }
                    }
                  }
                  const defence = getComponentValue(Defence, allAttackEntities[0]);
                  const position = getComponentValue(Position, allAttackEntities[0]);
                  setShowStationDetails(allAttackEntities[0]);
                  if (position && defence && +defence.value > 0) {
                    const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
                    camera.setScroll(x, y);
                  }
                } else {
                  toast.error("You don't have any Attack Ship, Please build one");
                }
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "15px",
            }}
          >
            {showActionName.passenger && <p>PASSENGER</p>}

            <img
              width={"30px"}
              height={"30px"}
              style={{ zIndex: 10, cursor: "pointer", pointerEvents: "fill" }}
              src="/ui/passengerShip.png"
              onMouseEnter={() => {
                input.disableInput();
                setShowActionName({ ...showActionName, passenger: true });
              }}
              onMouseLeave={() => {
                input.enableInput();
                setShowActionName({ ...showActionName, passenger: false });
              }}
              onClick={() => {
                sounds["click"].play();
                const allPassengerEntities = [...getComponentEntities(Position)].filter((entity) => {
                  const entityType = getComponentValue(EntityType, entity)?.value;
                  const isOwner = isOwnedByIndex(layers, entity);
                  const defence = getComponentValue(Defence, entity)?.value;
                  const level = getComponentValueStrict(Level, entity)?.value;

                  return (
                    defence && entityType && isOwner && +entityType === Mapping.passenger.id && +defence && +level > 0
                  );
                });
                const totalPassengerEntities = allPassengerEntities.length;
                if (totalPassengerEntities) {
                  const selectedStationEntity = getComponentValue(
                    ShowStationDetails,
                    stationDetailsEntityIndex
                  )?.entityId;
                  if (selectedStationEntity) {
                    const entityType = getComponentValue(EntityType, selectedStationEntity)?.value;
                    if (entityType && +entityType === Mapping.passenger.id) {
                      const index = allPassengerEntities.indexOf(selectedStationEntity);
                      if (!(index === totalPassengerEntities - 1)) {
                        const defence = getComponentValue(Defence, allPassengerEntities[index + 1]);
                        const position = getComponentValue(Position, allPassengerEntities[index + 1]);
                        if (defence && defence.value > 0) {
                          setShowStationDetails(allPassengerEntities[index + 1]);
                          if (position) {
                            const { x, y } = tileCoordToPixelCoord(
                              { x: position.x, y: position.y },
                              tileWidth,
                              tileHeight
                            );
                            camera.setScroll(x, y);
                          }
                        }
                        return;
                      }
                    }
                  }
                  const defence = getComponentValue(Defence, allPassengerEntities[0]);
                  const position = getComponentValue(Position, allPassengerEntities[0]);
                  setShowStationDetails(allPassengerEntities[0]);
                  if (position && defence && +defence.value > 0) {
                    const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
                    camera.setScroll(x, y);
                  }
                } else {
                  toast.error("You don't have any Passenger, Please build one");
                }
              }}
            />
          </div>
        </S.ActionButtons>
      </S.Container>
    );
  } else {
    return null;
  }
};
const S = {
  Container: styled.div`
    display: flex;
    padding-right: 10px;
    justify-content: end;
    gap: 10px;
    font-family: monospace;
  `,
  ActionButtons: styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 15px;
    height: calc(100vh - 250px);
  `,
  HighLight: styled.h3`
    color: white;
    position: absolute;
    top: 40px;
    left: 30px;
    pointer-events: fill;
  `,
  DetailsContainer: styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto 0;
  `,
  List: styled.div`
    pointer-events: fill;
    position: absolute;
    top: 80px;
    left: 50px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 340px;
    overflow-y: auto;
    ::-webkit-scrollbar {
      width: 0px;
      height: 0px;
    }
    scrollbar-width: none;
    *::-ms-scrollbar {
      width: 0px;
      height: 0px;
    }
  `,
  Player: styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    overflow-x: hidden;
    justify-content: flex-start;
    height: 100px;
  `,
  CheckBox: styled.input<{ owned?: boolean }>`
    -webkit-appearance: none;
    appearance: none;
    width: 2.3em;
    height: 2.3em;
    border-radius: 0.14em;
    margin-right: 0.5em;
    border: 0.2em solid ${({ owned }) => (owned ? "#33ff00" : "#00fde4")};
    outline: none;
    cursor: pointer;
    :checked {
      background-image: url("/ui/check.png");
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      background-repeat: no-repeat;
    }
  `,
  PLayerName: styled.p`
    font-size: 15px;
    font-weight: 700;
  `,
  Cash: styled.span`
    font-size: 14px;
    font-weight: 500;
    text-align: center;
  `,
};
