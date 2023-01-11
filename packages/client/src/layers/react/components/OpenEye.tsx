import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue, setComponent } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { ShowStationDetails } from "../../local/components";
import { useState } from "react";

const OpenEye = ({ name, layers }: { name?: string; layers: Layers }) => {
  const [showDetails, setShowDetails] = useState(false);
  const {
    network: {
      components: { Name },
    },
    phaser: {
      localIds: { showCircleForOwnedByIndex },
      localApi: { shouldShowCircleForOwnedBy },
      components: { ShowCircleForOwnedBy },
      sounds,
    },
  } = layers;
  const showOpenEye = getComponentValue(ShowCircleForOwnedBy, showCircleForOwnedByIndex)?.value;
  const allname = [...getComponentEntities(Name)];
  return (
    <S.Container>
      <img
        src={showOpenEye ? "/ui/Cog.png" : "/ui/Cog.png"}
        onClick={() => {
          shouldShowCircleForOwnedBy(!showOpenEye);
          sounds["click"].play();
          setShowDetails(!showOpenEye);
        }}
      />
      {showDetails && (
        <S.DetailsContainer>
          <img src="/ui/ShowAllUsersMenu.png" />
          <S.HighLight>HIGHLIGHT</S.HighLight>
          <S.List>
            <S.Player>
              <S.CheckBox type="checkbox" checked></S.CheckBox>
              <S.PLayerName>Owned</S.PLayerName>
            </S.Player>
            {allname.map((nameEntity) => {
              const name = getComponentValue(Name, nameEntity);
              return (
                <S.Player>
                  <S.CheckBox type="checkbox"></S.CheckBox>
                  <S.PLayerName>{name?.value} </S.PLayerName>
                </S.Player>
              );
            })}
          </S.List>
        </S.DetailsContainer>
      )}
    </S.Container>
  );
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
    background-color: black;
    border: 1px solid #00fae3;
    width: 30px;
    height: 30px;
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
          components: { ShowCircleForOwnedBy },
        },
      } = layers;
      return merge(Name.update$, ShowCircleForOwnedBy.update$).pipe(
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
