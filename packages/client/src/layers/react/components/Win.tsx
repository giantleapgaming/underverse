import styled, { keyframes } from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { getComponentEntities, getComponentValue, Has, Not, runQuery } from "@latticexyz/recs";
import { Mapping } from "../../../utils/mapping";
import { NFTImg } from "./NFTImg";

const Win = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Name, Cash, Faction, Population, Level, OwnedBy, Position, EntityType, Defence, NFTID },
    },
  } = layers;
  const allUserNameEntityId = [...getComponentEntities(Name)]
    .sort((prevEntity, presentEntity) => {
      const preCash = getComponentValue(Cash, prevEntity)?.value;
      const presentCash = getComponentValue(Cash, presentEntity)?.value;
      return preCash && presentCash ? +presentCash - +preCash : 0;
    })
    .sort((prevEntity, presentEntity) => {
      let preTotalPopulation = 0;
      let presentTotalPopulation = 0;
      [...getComponentEntities(Position)].forEach((entity) => {
        const entityType = getComponentValue(EntityType, entity)?.value;
        const ownedByEntityId = getComponentValue(OwnedBy, entity)?.value;
        const positionOwnedByIndex = world.entities.indexOf(ownedByEntityId);
        if (entityType && +entityType === Mapping.residential.id && prevEntity && prevEntity === positionOwnedByIndex) {
          const defence = getComponentValue(Defence, entity)?.value;
          const prePopulation = getComponentValue(Population, entity)?.value;
          if (prePopulation && defence) {
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
      return presentTotalPopulation - preTotalPopulation;
    });

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
                  </tr>
                  {allUserNameEntityId.map((nameEntity, index) => {
                    let totalPopulation = 0;
                    const name = getComponentValue(Name, nameEntity);
                    const cash = getComponentValue(Cash, nameEntity)?.value;
                    const nftId = getComponentValue(NFTID, nameEntity)?.value;
                    const factionNumber = getComponentValue(Faction, nameEntity)?.value;
                    [...getComponentEntities(Position)].forEach((entity) => {
                      const entityType = getComponentValue(EntityType, entity)?.value;
                      const OwnedByEntityId = getComponentValue(OwnedBy, entity)?.value;
                      const positionOwnedByIndex = world.entities.indexOf(OwnedByEntityId);
                      if (
                        entityType &&
                        +entityType === Mapping.residential.id &&
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
                        <td>{troffyImages[index] && <img src={troffyImages[index].src} width="54px" />}</td>
                        <td>{nftId && <NFTImg id={+nftId} size={64} />}</td>
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
                          {factionNumber && <img src={`/faction/${+factionNumber}.png`} width="44px" height="44px" />}
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
  overflow-y: auto;
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
      return <Win layers={layers} />;
    }
  );
};
