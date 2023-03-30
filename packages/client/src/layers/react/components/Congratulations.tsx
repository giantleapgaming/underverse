import styled, { keyframes } from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { getComponentEntities, getComponentValue, Has, Not, runQuery } from "@latticexyz/recs";
import { Mapping } from "../../../utils/mapping";
import { NFTImg } from "./NFTImg";

const Congratulations = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
    },
  } = layers;

  return (
    <>
      <Container
        onMouseEnter={() => {
          input.disableInput();
        }}
        onMouseLeave={() => {
          input.enableInput();
        }}
      >
        <RotatingGreenAsteroid src="../img/greenAsteroid.png" />
        <RotatingOrangeAsteroid src="/img/orangeAsteroid.png" />
        <RotatingResidential src="../img/residential.png" />
        <RotatingBlueAsteroid src="../img/blueAsteroid.png" />
        <RotatingHarvester src="/img/harvester.png" />
        <RotatingAttackShip src="/img/attachShip.png" />

        <WalletText>
          <img src="/img/Congratulations.png" />
          <Title>
            CADET TRAINING <br /> COMPLETED!
          </Title>
          <Img src="/faction/CadetWingImg.png" />
        </WalletText>
        <img src="../img/MintBadge.png" />
        <Twitter>
          <img src="../img/TweetBox.png" style={{ marginLeft: "-60px", height: "120px", width: "350px" }} />
          <img src="../img/TwitterIcon.png" style={{ marginTop: "20px", width: "45px", height: "40px" }} />
        </Twitter>
        <Conquer>
          <Title>CONQUER THE UNDERVERSE</Title>
          <img src="../img/Conquer.png" />
        </Conquer>
      </Container>
    </>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  z-index: 50;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-image: url("/img/bgWithoutSkyLines.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  pointer-events: all;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }
  scrollbar-width: none;
  *::-ms-scrollbar {
    width: 0px;
    height: 0px;
  }
`;
const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const antiRotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
`;

const upDownAnimation = keyframes`
  from {
    transform: translateY(0%);
  }
  to {
    transform: translateY(15%);
  }
`;

const moveLeftRightAnimation = keyframes`
  0% {
    transform: translateX(-10%);
  }
  50% {
    transform: translateX(10%);
  }
  100%{
    transform: translateX(-10%);
  }
`;

const RotatingGreenAsteroid = styled.img`
  position: absolute;
  right: 30%;
  top: 6%;
  animation: ${rotateAnimation} 10s linear infinite;
`;

const RotatingOrangeAsteroid = styled.img`
  position: absolute;
  left: 15%;
  top: 30%;
  scale: 0.7;
  animation: ${rotateAnimation} 18s linear infinite;
`;

const RotatingResidential = styled.img`
  position: absolute;
  bottom: 25%;
  left: 7%;
  width: 150px;
  animation: ${moveLeftRightAnimation} 7s linear infinite alternate;
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateY(100%);
  }
`;

const RotatingBlueAsteroid = styled.img`
  position: absolute;
  bottom: 50%;
  right: 11%;
  width: 90px;
  animation: ${antiRotateAnimation} 20s linear infinite;
  transition: transform 10s ease-in-out;
  &:hover {
    transform: translateX(30%);
  }
`;

const RotatingHarvester = styled.img`
  position: absolute;
  top: 5%;
  left: 26%;
  animation: ${upDownAnimation} 1s linear infinite alternate;
  transition: transform 0.1s ease-in-out;
  &:hover {
    transform: translateY(100%);
  }
`;

const RotatingAttackShip = styled.img`
  position: absolute;
  bottom: 20%;
  right: 8%;
  scale: 0.7;
  animation: ${upDownAnimation} 1s linear infinite alternate;
  transition: transform 0.1s ease-in-out;
  &:hover {
    transform: translateY(100%);
  }
`;

const WalletText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  gap: 30px;
  margin: 20px auto;
  z-index: 100;
  letter-spacing: 1;
`;

const Title = styled.div`
  font-size: 26px;
  color: #00fde4;
  letter-spacing: 0.9;
  line-height: 1.5;
  font-weight: bold;
`;

const Img = styled.img`
  width: 310px;
  height: 250px;
`;

const Twitter = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  margin-top: 45px;
  margin-bottom: 20px;
  cursor: pointer;
`;

const Conquer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  flex-direction: column;
  margin-left: auto;
  margin-bottom: 15px;
  margin-right: 10px;
`;

export const registerCongratulationsScreen = () => {
  registerUIComponent(
    "CongratulationsScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          components: { NFTID, Population, Cash, Position, EntityType, OwnedBy },
          network: { connectedAddress },
        },
        phaser: {
          components: { ShowWinGame },
          scenes: {
            Main: { input },
          },
          getValues: { getWinState },
        },
      } = layers;
      return merge(
        computedToStream(connectedAddress),
        NFTID.update$,
        Population.update$,
        Cash.update$,
        ShowWinGame.update$
      ).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const listOfPopulations = [...runQuery([Has(Position), Has(EntityType), Has(Population), Not(OwnedBy)])];
          if (listOfPopulations.length) {
            const population = getComponentValue(Population, listOfPopulations[0])?.value;
            if (population && +population === 0 && getWinState()) {
              input.disableInput();
              return { layers };
            }
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <Congratulations layers={layers} />;
    }
  );
};
