import styled from "styled-components";
import { EntityID, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { Layers } from "../../../../types";
import { useState } from "react";
import { factionData } from "../../../../utils/constants";

export const UserAction = ({ layers }: { layers: Layers }) => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    network: {
      world,
      components: { Name, Cash, Faction },
      network: { connectedAddress },
    },
    phaser: {
      localIds: { showCircleIndex },
      localApi: { shouldShowCircle },
      components: { ShowCircle },
      scenes: {
        Main: { camera },
      },
      sounds,
    },
  } = layers;
  const selectedEntities = getComponentValue(ShowCircle, showCircleIndex)?.selectedEntities ?? [];
  const allUserNameEntityId = [...getComponentEntities(Name)];
  const userEntityId = connectedAddress.get() as EntityID;
  const factionIndex = world.entities.indexOf(userEntityId);
  const faction = getComponentValue(Faction, factionIndex)?.value;
  if (userEntityId) {
    return (
      <S.Container>
        <img src={`/faction/${faction && +faction}.png`} width={"30px"} height={"30px"} style={{ marginTop: "-5px" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <img
            style={{ zIndex: 10, cursor: "pointer" }}
            src="/ui/Cog.png"
            width={"20px"}
            height={"20px"}
            onClick={() => {
              sounds["click"].play();
              setShowDetails(!showDetails);
            }}
          />
          <img
            width={"20px"}
            height={"20px"}
            style={{ zIndex: 10, cursor: "pointer" }}
            src="/ui/recenter.png"
            onClick={() => {
              sounds["click"].play();
              camera.centerOn(0, -1);
            }}
          />
        </div>
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
                  <S.Player key={nameEntity}>
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
                    ></S.CheckBox>
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
    gap: 10px;
    margin-top: 10px;
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
    justify-content: flex-start;
  `,
  CheckBox: styled.input`
    /* removing default appearance */
    -webkit-appearance: none;
    appearance: none;
    /* creating a custom design */
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
