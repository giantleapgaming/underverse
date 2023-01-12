import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { EntityID, EntityIndex, getComponentEntities, getComponentValue, setComponent } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { ShowStationDetails } from "../../local/components";
import { useState } from "react";
import checkIcon from "/ui/check.png";

const OpenEye = ({ name, layers }: { name?: string; layers: Layers }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const {
    network: {
      world,
      components: { Name },
      network: { connectedAddress },
    },
    phaser: {
      localIds: { showCircleIndex },
      localApi: { shouldShowCircle },
      components: { ShowCircle },
      sounds,
    },
  } = layers;
  const selectedEntities = getComponentValue(ShowCircle, showCircleIndex)?.selectedEntities ?? [];
  const allUserNameEntityId = [...getComponentEntities(Name)];
  const userEntityId = connectedAddress.get() as EntityID;

  if (userEntityId) {
    return (
      <S.Container>
        <img
          style={{ zIndex: 10 }}
          src="/ui/Cog.png"
          onClick={() => {
            sounds["click"].play();
            setShowDetails(!showDetails);
          }}
        />
        {showDetails && (
          <S.DetailsContainer>
            <img src="/ui/ShowAllUsersMenu.png" />
            <S.HighLight>HIGHLIGHT</S.HighLight>
            <S.List>
              {allUserNameEntityId.map((nameEntity) => {
                const name = getComponentValue(Name, nameEntity);
                const owner = world.entities[nameEntity] === userEntityId;
                const indexOf = selectedEntities.indexOf(nameEntity);
                const exists = selectedEntities.some((entity) => entity === nameEntity);

                return (
                  <S.Player key={nameEntity}>
                    <S.CheckBox
                      type="checkbox"
                      className={exists ? "checked" : ""}
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
                    <S.PLayerName>{owner ? "Owned" : name?.value} </S.PLayerName>
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
    padding-right: 15px;
  `,

  HighLight: styled.h2`
    color: white;
    position: absolute;
    top: 30px;
    left: 50px;
  `,

  DetailsContainer: styled.div`
    position: relative;
    margin-top: -30px;
  `,

  List: styled.div`
    position: absolute;
    top: 100px;
    left: 60px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  Player: styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-start;
  `,
  CheckBox: styled.input`
    /* removing default appearance */
    -webkit-appearance: none;
    appearance: none;
    /* creating a custom design */
    width: 1.6em;
    height: 1.6em;
    border-radius: 0.15em;
    margin-right: 0.5em;
    border: 0.15em solid #007a7e;
    outline: none;
    cursor: pointer;

    :checked {
      background-color: #007a7e;
      position: relative;
    }

    :checked::before {
      font-size: 1.5em;
      color: #fff;
      position: absolute;
      right: 1px;
      top: -5px;
    }
  `,

  PLayerName: styled.p`
    color: white;
    font-size: large;
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
      return <OpenEye name={name} layers={layers} />;
    }
  );
};
