import styled from "styled-components";
import { EntityID, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { Layers } from "../../../../types";
import { factionData } from "../../../../utils/constants";
import { Mapping } from "../../../../utils/mapping";
export const Highlight = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Name, Cash, Faction, Population, Level, OwnedBy, Position, EntityType },
      network: { connectedAddress },
    },
    phaser: {
      localIds: { showCircleIndex, stationDetailsEntityIndex },
      localApi: { shouldShowCircle },
      components: { ShowCircle, ShowHighLight },
    },
  } = layers;
  const selectedEntities = getComponentValue(ShowCircle, showCircleIndex)?.selectedEntities ?? [];
  const allUserNameEntityId = [...getComponentEntities(Name)].sort((prevEntity, presentEntity) => {
    let preTotalPopulation = 0;
    let presentTotalPopulation = 0;
    const preCash = getComponentValue(Cash, prevEntity)?.value;
    const presentCash = getComponentValue(Cash, presentEntity)?.value;
    [...getComponentEntities(Position)].forEach((entity) => {
      const entityType = getComponentValue(EntityType, entity)?.value;
      const ownedByEntityId = getComponentValue(OwnedBy, entity)?.value;
      const positionOwnedByIndex = world.entities.indexOf(ownedByEntityId);
      if (entityType && +entityType === Mapping.residential.id && prevEntity && prevEntity === positionOwnedByIndex) {
        const prePopulation = getComponentValue(Population, entity)?.value;
        if (prePopulation) {
          preTotalPopulation += +prePopulation;
        }
      }
      if (
        entityType &&
        +entityType === Mapping.residential.id &&
        presentEntity &&
        presentEntity === positionOwnedByIndex
      ) {
        const presentPopulation = getComponentValue(Population, entity)?.value;
        if (presentPopulation) {
          presentTotalPopulation += +presentPopulation;
        }
      }
    });

    if (preTotalPopulation - presentTotalPopulation) {
      return presentTotalPopulation - preTotalPopulation;
    } else {
      return preCash && presentCash ? +presentCash - +preCash : 0;
    }
  });
  const userEntityId = connectedAddress.get() as EntityID;
  const showDetails = getComponentValue(ShowHighLight, stationDetailsEntityIndex)?.value;
  if (userEntityId) {
    return (
      <S.Container>
        {showDetails && (
          <S.DetailsContainer>
            <img src="/ui/CogButtonMenu.png" />
            <S.HighLight>HIGHLIGHT</S.HighLight>
            <S.List>
              {allUserNameEntityId.map((nameEntity) => {
                let totalPopulation = 0;
                let totalLevel = 0;
                const name = getComponentValue(Name, nameEntity);
                const cash = getComponentValue(Cash, nameEntity)?.value;
                const owner = world.entities[nameEntity] === userEntityId;
                const indexOf = selectedEntities.indexOf(nameEntity);
                const exists = selectedEntities.some((entity) => entity === nameEntity);
                const factionNumber = getComponentValue(Faction, nameEntity)?.value;
                const faction = factionData.find((f) => f.factionNumber === (factionNumber && +factionNumber));
                [...getComponentEntities(Position)].forEach((entity) => {
                  const entityType = getComponentValue(EntityType, entity)?.value;
                  const OwnedByEntityId = getComponentValue(OwnedBy, entity)?.value;
                  const positionOwnedByIndex = world.entities.indexOf(OwnedByEntityId);
                  if (
                    entityType &&
                    (+entityType === Mapping.residential.id || +entityType === Mapping.passenger.id) &&
                    nameEntity &&
                    nameEntity === positionOwnedByIndex
                  ) {
                    const population = getComponentValue(Population, entity)?.value;
                    const level = getComponentValue(Level, entity)?.value;
                    if (population && level) {
                      totalPopulation += +population;
                      totalLevel += +level;
                    }
                  }
                });
                return (
                  <div key={nameEntity} style={{ height: "40px" }}>
                    <S.Player>
                      <S.CheckBox
                        type="checkbox"
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
                      <S.PLayerName style={{ color: faction?.color }}>
                        {owner ? "Owned" : name?.value}
                        <br />
                        <S.Cash style={{ color: "white" }}>
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
                              style={{ height: "15px", width: "20px", margin: " 0 4px" }}
                            />
                            ({totalPopulation})
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
      </S.Container>
    );
  } else {
    return null;
  }
};
const S = {
  Container: styled.div`
    pointer-events: fill;
    display: flex;
    padding-right: 10px;
    justify-content: end;
    gap: 10px;
    margin-top: 100px;
  `,
  HighLight: styled.h3`
    color: white;
    position: absolute;
    top: 30px;
    left: 90px;
  `,
  DetailsContainer: styled.div`
    position: relative;
    margin-top: -30px;
  `,
  List: styled.div`
    position: absolute;
    top: 80px;
    left: 70px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 440px;
    overflow-y: auto;
    ::-webkit-scrollbar {
      width: 10px;
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
  CheckBox: styled.input`
    -webkit-appearance: none;
    appearance: none;
    width: 2.3em;
    height: 2.3em;
    border-radius: 0.12em;
    margin-right: 0.5em;
    border: 0.4em solid #00fde4;
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
    font-size: 16px;
    font-weight: 700;
  `,
  Cash: styled.span`
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  `,
};
