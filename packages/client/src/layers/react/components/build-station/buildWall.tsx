import { getComponentValue } from "@latticexyz/recs";
import styled from "styled-components";
import { Layers } from "../../../../types";

export const BuildWall = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      components: { ShowStationDetails },
      localApi: { setBuildWall },
      localIds: { stationDetailsEntityIndex },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

  if (selectedEntity) {
    return (
      <S.Flex>
        <S.Button
          onClick={() => setBuildWall({ type: "buildWall", showBuildWall: true, showHover: true })}
          title="Habitat"
        >
          <S.Img src="/layout/hex.png" width="70px" height="64px" />
          <S.Img src={`/build-stations/wall.png`} width="30px" height="30px" />
        </S.Button>
      </S.Flex>
    );
  } else {
    return null;
  }
};

const S = {
  Flex: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: start;
    gap: 16px;
    height: 100%;
    width: 90%;
    justify-content: space-around;
    padding-bottom: 30px;
  `,
  Button: styled.div`
    cursor: pointer;
    position: relative;
    width: 54px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 50px;
  `,
  Img: styled.img`
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    margin: auto;
  `,
  Text: styled.div`
    align-items: center;
    font-size: 12px;
  `,
};
