import styled from "styled-components";
import { EntityID, getComponentValue } from "@latticexyz/recs";
import { Layers } from "../../../../types";
import { FactionImg } from "./FactionImg";

export const UserAction = ({ layers, hideFactionImage }: { layers: Layers; hideFactionImage?: boolean }) => {
  const {
    network: {
      network: { connectedAddress },
    },
    phaser: {
      localIds: { stationDetailsEntityIndex },
      localApi: { setShowHighLight },
      components: { ShowHighLight },
      scenes: {
        Main: { camera },
      },
      sounds,
    },
  } = layers;
  const userEntityId = connectedAddress.get() as EntityID;
  const showDetails = getComponentValue(ShowHighLight, stationDetailsEntityIndex)?.value;
  if (userEntityId) {
    return (
      <S.Container>
        {!hideFactionImage && <FactionImg layers={layers} />}
        {/* <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <img
            style={{ zIndex: 10, cursor: "pointer" }}
            src="/ui/Cog.png"
            width={"20px"}
            height={"20px"}
            onClick={() => {
              sounds["click"].play();
              setShowHighLight(!showDetails);
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
        </div> */}
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
    justify-content: center;
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
