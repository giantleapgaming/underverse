import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";

export const BuildFromShipyardLayout = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      components: { Faction },
      world,
      network: { connectedAddress },
    },
    phaser: {
      sounds,
      components: { ShowStationDetails },
      localApi: { setBuild },
      localIds: { stationDetailsEntityIndex },
    },
  } = layers;
  const entityIndex = world.entities.indexOf(connectedAddress.get());
  const factionNumber = getComponentValueStrict(Faction, entityIndex).value;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

  const build = (entityType: number) => {
    sounds["click"].play();
    setBuild({ x: 0, y: 0, canPlace: true, entityType, show: false, isBuilding: true });
  };

  if (selectedEntity) {
    return (
      <S.Flex>
        <S.Button onClick={() => build(Mapping.attack.id)} title="Attack ship">
          <S.Img src="/layout/hex.png" width="70px" height="64px" />
          <S.Img src={`/build-stations/attack.png`} width="30px" height="30px" />
        </S.Button>
        <S.Button onClick={() => build(Mapping.harvester.id)} title="Harvester">
          <S.Img src="/layout/hex.png" width="70px" height="64px" />
          <S.Img src={`/build-stations/harvester.png`} width="30px" height="30px" />
        </S.Button>
        <S.Button onClick={() => build(Mapping.refuel.id)} title="Fueler">
          <S.Img src="/layout/hex.png" width="70px" height="64px" />
          <S.Img src="/build-stations/fueler.png" width="30px" height="30px" />
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