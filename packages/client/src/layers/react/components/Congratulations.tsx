import styled, { keyframes } from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { getNftId } from "../../network/utils/getNftId";
import { useState } from "react";
import { toast } from "sonner";
const Congratulations = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
    },
    network: {
      api: { tutorial1CompleteSystem },
      network: { connectedAddress },
      nft: { rookieNft },
    },
  } = layers;
  const [loading, setLoading] = useState(false);
  const [minted, setMinter] = useState(false);
  const isNftAlreadyMinted = !!rookieNft?.length;
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
            ROOKIE TRAINING <br /> COMPLETED!
          </Title>
          <Img src="/faction/rookie.png" />
        </WalletText>
        {loading ? (
          <Loading>Minting a Badge...</Loading>
        ) : (
          <>
            {minted || isNftAlreadyMinted ? (
              <Loading>NFT Already Minted</Loading>
            ) : (
              <img
                style={{ cursor: "pointer" }}
                src="../img/MintBadge.png"
                onClick={async () => {
                  const params = new URLSearchParams(window.location.search);
                  const chainIdString = params.get("chainId");
                  setLoading(true);
                  try {
                    const response = await fetch("https://api.giantleap.gg/api/tutorial-nft", {
                      method: "POST",
                      body: JSON.stringify({
                        address: connectedAddress.get(),
                        chainId: chainIdString && +chainIdString,
                        nftContractAddress: "0xa13809abcBCCe2a1C9f1dc64242a9E21A4C8444F",
                      }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    const data = await response.json();
                    if (data.status) {
                      toast.success("Congratulations! You have successfully minted a badge!");
                      setMinter(true);
                    } else {
                      toast.error("You have already minted a badge!");
                    }
                    setLoading(false);
                  } catch (e) {
                    console.log(e);
                    toast.error("Something went wrong, please try again later!");
                    setLoading(true);
                  }
                }}
              />
            )}
          </>
        )}
        <Twitter>
          <img src="../img/TweetBox.png" style={{ marginLeft: "-60px", height: "120px", width: "350px" }} />
          <img src="../img/TwitterIcon.png" style={{ marginTop: "20px", width: "45px", height: "40px" }} />
        </Twitter>
        <Conquer
          onClick={async () => {
            const nftDetails = getNftId(layers);
            if (!nftDetails) {
              return;
            }
            toast.promise(
              async () => {
                try {
                  await tutorial1CompleteSystem(nftDetails.tokenId);
                } catch (e: any) {
                  console.log(e);
                  throw new Error(e?.reason.replace("execution reverted:", "") || e.message);
                }
              },
              {
                loading: "Transaction in progress",
                success: `Transaction successful`,
                error: (e) => e.message,
              }
            );
          }}
        >
          <Title>CONTINUE TO CADET TRAINING</Title>
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
const Loading = styled.p`
  font-size: 16px;
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
  cursor: pointer;
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
          components: { NFTID, TutorialStep },
          network: { connectedAddress },
        },
        phaser: {
          components: { SelectedNftID },
          localIds: { nftId },
          scenes: {
            Main: { input },
          },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, TutorialStep.update$, SelectedNftID.update$).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const nftDetails = getNftId(layers);
          const nftEntity = [...getComponentEntities(NFTID)].find((nftId) => {
            const id = +getComponentValueStrict(NFTID, nftId).value;
            return nftDetails?.tokenId === id;
          });
          const selectedNftId = getComponentValue(SelectedNftID, nftId)?.selectedNftID;
          const allNftsEntityIds = [...getComponentEntities(NFTID)];
          const doesNftExist = allNftsEntityIds.some((entityId) => {
            const selectedNft = getComponentValueStrict(NFTID, entityId).value;
            return +selectedNft === selectedNftId;
          });
          if (doesNftExist) {
            const number = getComponentValue(TutorialStep, nftEntity)?.value;
            if (number && +number === 130) {
              return { layers };
            } else {
              return;
            }
          } else {
            return;
          }
        })
      );
    },
    ({ layers }) => {
      return <Congratulations layers={layers} />;
    }
  );
};
