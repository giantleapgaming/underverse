import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";

export const Layout = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      components: { Faction },
      world,
      network: { connectedAddress },
    },
    phaser: {
      sounds,
      components: { Build },
      localApi: { setBuild },
      localIds: { buildId },
    },
  } = layers;
  const entityIndex = world.entities.indexOf(connectedAddress.get());
  const factionNumber = getComponentValueStrict(Faction, entityIndex).value;
  const buildDetails = getComponentValue(Build, buildId)?.isBuilding;

  const build = (entityType: number) => {
    sounds["click"].play();
    setBuild({ x: 0, y: 0, canPlace: true, entityType, show: false, isBuilding: true });
  };

  if (buildDetails) {
    return null;
  } else {
    return (
      <S.Container>
        <S.Border>
          <S.Flex>
            <S.Button onClick={() => build(Mapping.residential.id)}>
              <S.Img src="/layout/hex.png" />
              <S.Img src={`/build-stations/${+factionNumber}-1-0.png`} width="30px" height="30px" />
            </S.Button>
            <S.Button onClick={() => build(Mapping.attack.id)}>
              <S.Img src="/layout/hex.png" />
              <S.Img src={`/build-stations/attack-${+factionNumber}-1.png`} width="30px" height="30px" />
            </S.Button>
            <S.Button onClick={() => build(Mapping.godown.id)}>
              <S.Img src="/layout/hex.png" />
              <S.Img src={`/build-stations/cargo-1-0.png`} width="30px" height="30px" />
            </S.Button>
            <S.Button onClick={() => build(Mapping.harvester.id)}>
              <S.Img src="/layout/hex.png" />
              <S.Img src="/build-stations/harvester.png" width="30px" height="30px" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
            <S.Button>
              <S.Img src="/layout/hex.png" />
            </S.Button>
          </S.Flex>
        </S.Border>
      </S.Container>
    );
  }
};

const S = {
  Container: styled.div`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    gap: 20px;
    width: 100%;
  `,
  Border: styled.div`
    position: relative;
    width: 550px;
    height: 193px;
    background-image: url("/layout/bottom-menu-layout.png");
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    flex-direction: column;
    pointer-events: fill;
    padding: 21px 0 0 37px;
  `,
  Flex: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: start;
    gap: 16px;
  `,
  Button: styled.div`
    cursor: pointer;
    position: relative;
    width: 54px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  Img: styled.img`
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    margin: auto;
  `,
};
