import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { EntityID, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { useState } from "react";
import { factionData } from "../../../utils/constants";

const OpenEye = ({ layers }: { layers: Layers }) => {
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
  const userEntityId = connectedAddress.get() as EntityID;

  if (userEntityId) {
    return (
      <S.Container>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            style={{ zIndex: 10, cursor: "pointer" }}
            src="/ui/Cog.png"
            onClick={() => {
              sounds["click"].play();
              setShowDetails(!showDetails);
            }}
          />
          <img
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
              {factionData.map((data) => {
                const userList = [...getComponentEntities(Name)].filter((entity) => {
                  const faction = getComponentValue(Faction, entity)?.value;
                  return faction && +faction === data.factionNumber;
                });
                const indexOf = selectedEntities.indexOf(data.factionNumber);
                const exists = selectedEntities.some((entity) => entity === data.factionNumber);

                return (
                  <S.Player key={data.factionNumber}>
                    <S.CheckBox
                      type="checkbox"
                      className={exists ? "checked" : ""}
                      checked={exists}
                      onChange={() => {
                        if (!exists) {
                          const list = [...selectedEntities, data.factionNumber];
                          shouldShowCircle(list);
                        } else {
                          const newList = [...selectedEntities];
                          newList.splice(indexOf, 1);
                          shouldShowCircle(newList);
                        }
                      }}
                    ></S.CheckBox>
                    <div>
                      <S.Cash style={{ color: data.color }}>{data.name}</S.Cash>
                      <div style={{ marginLeft: "10px" }}>
                        {userList.length ? (
                          userList.map((nameEntity, i) => {
                            const name = getComponentValue(Name, nameEntity);
                            const cash = getComponentValue(Cash, nameEntity)?.value;
                            const owner = world.entities[nameEntity] === userEntityId;
                            return (
                              <S.PLayerName style={{ color: data.color }}>
                                {i + 1}. {owner ? "Owned" : name?.value} (
                                {cash &&
                                  new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(+cash / 1_000_000)}
                                )
                              </S.PLayerName>
                            );
                          })
                        ) : (
                          <p>-:-</p>
                        )}
                      </div>
                    </div>
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
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    padding-right: 10px;
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
  `,
  Player: styled.div`
    display: flex;
    gap: 6px;
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
    font-size: 14px;
    font-weight: 700;
  `,

  Cash: styled.span`
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  `,
};

export const registerOpenEyeDetails = () => {
  registerUIComponent(
    "OpenEye",
    {
      colStart: 10,
      colEnd: 13,
      rowStart: 2,
      rowEnd: 12,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Name },
          world,
        },
        phaser: {
          components: { ShowCircle },
        },
      } = layers;
      return merge(Name.update$, ShowCircle.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) {
            const name = getComponentValue(Name, userLinkWithAccount)?.value;
            return {
              name,
              layers,
            };
          } else {
            return;
          }
        })
      );
    },
    ({ name, layers }) => {
      return <OpenEye layers={layers} />;
    }
  );
};
