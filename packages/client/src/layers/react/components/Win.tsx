import styled, { keyframes } from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { EntityID, getComponentEntities, getComponentValue, Has, Not, runQuery } from "@latticexyz/recs";
import { Mapping } from "../../../utils/mapping";
import { walletAddressLoginDisplay } from "../utils/walletAddress";
import { getNftId } from "../../network/utils/getNftId";
import { useState } from "react";

const Win = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Name, Cash, Faction, Population, Level, OwnedBy, Position, EntityType },
      network: { connectedAddress },
    },
  } = layers;
  const allUserNameEntityId = [...getComponentEntities(Name)].sort((prevEntity, presentEntity) => {
    let preTotalPopulation = 0;
    let presentTotalPopulation = 0;
    const preCash = getComponentValue(Cash, prevEntity)?.value;
    const presentCash = getComponentValue(Cash, presentEntity)?.value;
    [...getComponentEntities(Position)].forEach((entity) => {
      const entityType = getComponentValue(EntityType, entity)?.value;
      const ownedByEntityId = getComponentValue(OwnedBy, entity)?.value;
      const positionOwnedByIndex = world.entities.indexOf(ownedByEntityId);
      if (entityType && +entityType === Mapping.residential.id && prevEntity && prevEntity === positionOwnedByIndex) {
        const prePopulation = getComponentValue(Population, entity)?.value;
        if (prePopulation) {
          preTotalPopulation += +prePopulation;
        }
      }
      if (
        entityType &&
        +entityType === Mapping.residential.id &&
        presentEntity &&
        presentEntity === positionOwnedByIndex
      ) {
        const presentPopulation = getComponentValue(Population, entity)?.value;
        if (presentPopulation) {
          presentTotalPopulation += +presentPopulation;
        }
      }
    });

    if (preTotalPopulation - presentTotalPopulation) {
      return presentTotalPopulation - preTotalPopulation;
    } else {
      return preCash && presentCash ? +presentCash - +preCash : 0;
    }
  });
  const nftDetails = getNftId(layers);
  const userEntityId = connectedAddress.get() as EntityID;
  return (
    <>
      <Container>
        <RotatingGreenAsteroid src="../img/greenAsteroid.png" />
        <RotatingOrangeAsteroid src="/img/orangeAsteroid.png" />
        <RotatingResidential src="../img/residential.png" />
        <RotatingBlueAsteroid src="../img/blueAsteroid.png" />
        <RotatingHarvester src="/img/harvester.png" />
        <RotatingAttackShip src="/img/attachShip.png" />

        <WalletText>
          <div>
            <p style={{ margin: "0px", color: "wheat", marginBottom: "20px" }}>WELCOME TO</p>
            <img src="/img/matchOver.png" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "50px",
              }}
            >
              <table style={{ color: "white", width: "80%" }}>
                <tbody style={{ textAlign: "center" }}>
                  <tr>
                    <th></th>
                    <th>{<img src="/img/winner.png" />}</th>
                    <th>Name</th>
                    <th>{<img src="/img/user.png" />}</th>
                    <th>{<img src="/img/USCoin.png" />}</th>
                    <th>{<img src="/img/tag.png" />}</th>
                    <th></th>
                  </tr>
                  {allUserNameEntityId.map((nameEntity, index) => {
                    const [copy, setCopy] = useState(false);
                    let totalPopulation = 0;
                    const name = getComponentValue(Name, nameEntity);
                    const cash = getComponentValue(Cash, nameEntity)?.value;
                    const factionNumber = getComponentValue(Faction, nameEntity)?.value;
                    [...getComponentEntities(Position)].forEach((entity) => {
                      const entityType = getComponentValue(EntityType, entity)?.value;
                      const OwnedByEntityId = getComponentValue(OwnedBy, entity)?.value;
                      const positionOwnedByIndex = world.entities.indexOf(OwnedByEntityId);
                      if (
                        entityType &&
                        (+entityType === Mapping.residential.id || +entityType === Mapping.passenger.id) &&
                        nameEntity &&
                        nameEntity === positionOwnedByIndex
                      ) {
                        const population = getComponentValue(Population, entity)?.value;
                        const level = getComponentValue(Level, entity)?.value;
                        if (population && level) {
                          totalPopulation += +population;
                        }
                      }
                    });
                    return (
                      <tr key={nameEntity}>
                        <td>{troffyImages[index] && <img src={troffyImages[index].src} />}</td>
                        <td>
                          <img src={nftDetails && nftDetails.imageUrl} width="24px" height="24px" />
                        </td>
                        <td style={{ fontSize: "20px" }}>{name?.value}</td>
                        <td style={{ fontSize: "20px" }}>{totalPopulation} </td>
                        <td style={{ fontSize: "20px" }}>
                          {cash &&
                            new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(+cash / 1_000_000)}{" "}
                        </td>
                        <td>
                          {factionNumber && <img src={`/faction/${+factionNumber}.png`} width="24px" height="24px" />}
                        </td>
                        <td style={{ fontSize: "18px", fontWeight: "bold" }}>
                          {copy ? "Copied" : walletAddressLoginDisplay(`${connectedAddress.get()}`)}
                          <span>
                            <img
                              src="/img/copy.png"
                              style={{ marginLeft: "10px", cursor: "pointer", width: "18px", height: "18px" }}
                              onClick={() => {
                                setCopy(true);
                                navigator.clipboard.writeText(`${connectedAddress.get()}`);
                                setTimeout(() => {
                                  setCopy(false);
                                }, 1000);
                              }}
                            />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </WalletText>
      </Container>
    </>
  );
};
const troffyImages = [
  { src: "/img/goldTroffy.png" },
  { src: "/img/silverTroffy.png" },
  { src: "/img/bronzeTroffy.png" },
];
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
  overflow: hidden;
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
  gap: 50px;
  margin: 20px auto;
  z-index: 100;
  letter-spacing: 1;
`;
const List = styled.div`
  position: absolute;
  top: 80px;
  left: 70px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 440px;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 10px;
  }
`;

const Player = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  overflow-x: hidden;
  justify-content: flex-start;
  height: 100px;
`;

const CheckBox = styled.input`
  -webkit-appearance: none;
  appearance: none;
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
`;

const PLayerName = styled.p`
  font-size: 16px;
  font-weight: 700;
`;
const CashAmount = styled.span`
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

export const registerWinScreen = () => {
  registerUIComponent(
    "WinScreen",
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
          scenes: {
            Main: { input },
          },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, Population.update$, Cash.update$).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const listOfPopulations = [...runQuery([Has(Position), Has(EntityType), Has(Population), Not(OwnedBy)])];
          if (listOfPopulations.length) {
            const population = getComponentValue(Population, listOfPopulations[0])?.value;
            if (population && +population === 0) {
              input.disableInput();
              return { layers };
            }
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <Win layers={layers} />;
    }
  );
};
