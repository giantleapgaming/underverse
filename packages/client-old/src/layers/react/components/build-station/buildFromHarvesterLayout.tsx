import { getComponentValue } from "@latticexyz/recs";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";

export const BuildFromHarvesterLayout = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      sounds,
      components: { ShowStationDetails },
      localApi: { setBuild, setBuildWall },
      localIds: { stationDetailsEntityIndex },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

  const build = (entityType: number) => {
    sounds["click"].play();
    setBuild({ x: 0, y: 0, canPlace: true, entityType, show: false, isBuilding: true });
  };

  if (selectedEntity) {
    return (
      <S.Flex>
        <S.Button onClick={() => build(Mapping.residential.id)}>
          <S.Title>Habitat</S.Title>
          <S.Img src="/layout/hex.png" width="50px" height="44px" />
          <S.Img src={`/build-stations/space-station.png`} width="30px" height="30px" />
          <S.ImgCrystal>
            <img src="/build-stations/crystal.png" width="15px" height="15px" />
            <S.BalanceText>1</S.BalanceText>
          </S.ImgCrystal>
        </S.Button>
        <S.Button onClick={() => build(Mapping.godown.id)}>
          <S.Title>Depot</S.Title>
          <S.Img src="/layout/hex.png" width="50px" height="44px" />
          <S.Img src={`/build-stations/cargo.png`} width="30px" height="30px" />
          <S.ImgCrystal>
            <img src="/build-stations/crystal.png" width="15px" height="15px" />
            <S.BalanceText>1</S.BalanceText>
          </S.ImgCrystal>
        </S.Button>
        <S.Button onClick={() => build(Mapping.shipyard.id)}>
          <S.Title>Shipyard</S.Title>
          <S.Img src="/layout/hex.png" width="50px" height="44px" />
          <S.Img src={`/build-stations/shipyard.png`} width="30px" height="30px" />
          <S.ImgCrystal>
            <img src="/build-stations/crystal.png" width="15px" height="15px" />
            <S.BalanceText>1</S.BalanceText>
          </S.ImgCrystal>
        </S.Button>
        <S.Button
          onClick={() => setBuildWall({ type: "buildWall", showBuildWall: true, showHover: true })}
          title="wall"
        >
          <S.Title>WALL</S.Title>
          <S.Img src="/layout/hex.png" width="50px" height="44px" />
          <S.Img src={`/build-stations/wall.png`} width="30px" height="30px" />
          <S.ImgCrystal>
            <img src="/build-stations/crystal.png" width="15px" height="15px" />
            <S.BalanceText>1</S.BalanceText>
          </S.ImgCrystal>
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
  Title: styled.p`
    margin-top: -70px;
    text-align: center;
    font-size: 12px;
  `,
  BalanceText: styled.p`
    font-size: 10px;
  `,
  Img: styled.img`
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    margin: auto;
  `,
  ImgCrystal: styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    position: absolute;
    bottom: -40px;
    left: -10px;
  `,
  Text: styled.div`
    align-items: center;
    font-size: 12px;
  `,
};
