import styled from "styled-components";
import { EntityID, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { Layers } from "../../../../types";
import { factionData } from "../../../../utils/constants";

export const Highlight = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Name, Cash, Faction },
      network: { connectedAddress },
    },
    phaser: {
      localIds: { showCircleIndex, stationDetailsEntityIndex },
      localApi: { shouldShowCircle },
      components: { ShowCircle, ShowHighLight },
    },
  } = layers;
  const selectedEntities = getComponentValue(ShowCircle, showCircleIndex)?.selectedEntities ?? [];
  const allUserNameEntityId = [...getComponentEntities(Name)];
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
                const name = getComponentValue(Name, nameEntity);
                const cash = getComponentValue(Cash, nameEntity)?.value;
                const owner = world.entities[nameEntity] === userEntityId;
                const indexOf = selectedEntities.indexOf(nameEntity);
                const exists = selectedEntities.some((entity) => entity === nameEntity);
                const factionNumber = getComponentValue(Faction, nameEntity)?.value;
                const faction = factionData.find((f) => f.factionNumber === (factionNumber && +factionNumber));
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
                          <span style={{ color: faction?.color }}>({faction?.name})</span>
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
    max-height: 440px;
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
