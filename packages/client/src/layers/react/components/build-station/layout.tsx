import { getComponentValue } from "@latticexyz/recs";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { UserDetails } from "./userDetails";
import { Focus } from "../Focus";
import { tutorialHighlightOrderCompleted, tutorialHighlightOrderPresent } from "../utils/tutorialHighlightOrder";
import { objectListTutorialDataListPart1 } from "../TutorialsList";

export const Layout = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      sounds,
      components: { Build, ShowStationDetails },
      localApi: { setBuild },
      localIds: { buildId, stationDetailsEntityIndex },
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const buildDetails = getComponentValue(Build, buildId)?.isBuilding;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

  const build = (entityType: number) => {
    sounds["click"].play();
    setBuild({ x: 0, y: 0, canPlace: true, entityType, show: false, isBuilding: true });
  };
  if (buildDetails || selectedEntity) {
    return null;
  } else {
    return (
      <S.Container
        onMouseEnter={() => {
          input.disableInput();
        }}
        onMouseLeave={() => {
          input.enableInput();
        }}
      >
        <UserDetails layers={layers} />
        <S.Border>
          <S.Flex>
            <Focus
              highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart1["Deploy"])}
              present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart1["Deploy"])}
            >
              <S.Button
                onClick={() => {
                  input.enableInput();
                  build(Mapping.harvester.id);
                }}
              >
                <S.Img src="/layout/hex.png" width="70px" height="64px" />
                <S.Img src="/build-stations/harvester.png" width="30px" height="30px" />
              </S.Button>
            </Focus>
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
    justify-content: center;
    gap: 10px;
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
  `,
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
  `,
  Img: styled.img`
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    margin: auto;
  `,
};
