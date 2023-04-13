import styled, { keyframes } from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { getNftId } from "../../network/utils/getNftId";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { tutorialHighlightOrderCompleted, tutorialHighlightOrderPresent } from "./utils/tutorialHighlightOrder";
import { objectListTutorialDataListPart1, objectListTutorialDataListPart2 } from "./TutorialsList";
import { Focus } from "./Focus";
import Confetti from "react-confetti";

const Congratulations = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
    },
    network: {
      api: { tutorial1CompleteSystem, purgeUserEntities },
      network: { connectedAddress },
      components: { NFTID, TutorialStep },
      nft: { rookieNft, cadetNft },
    },
  } = layers;
  const [loading, setLoading] = useState(false);
  const [minted, setMinter] = useState(false);
  const [isPartyTime, setIsPartyTime] = useState(false);
  const nftDetails = getNftId(layers);
  const nftEntity = [...getComponentEntities(NFTID)].find((nftId) => {
    const id = +getComponentValueStrict(NFTID, nftId).value;
    return nftDetails?.tokenId === id;
  });
  const number = getComponentValue(TutorialStep, nftEntity)?.value;
  const isCadet = number && (+number == 250 || +number == 260);
  const isRookie = number && +number == 130;

  const purge = async () => {
    const nftDetails = getNftId(layers);
    if (nftDetails) {
      try {
        await purgeUserEntities(nftDetails.tokenId);
      } catch (e) {
        console.error(e);
      }
    }
  };
  useEffect(() => {
    if (number && +number == 250) {
      purge();
    }
  });

  useEffect(() => {
    // Trigger animation after component has rendered
    const animationTimeout = setTimeout(() => {
      // Set a ref to the image element
      const RookieImage = document.getElementById("RookieImage");
      const CadetImage = document.getElementById("CadetImage");
      if (RookieImage && CadetImage) {
        RookieImage.style.animationPlayState = "running";
        CadetImage.style.animationPlayState = "running"; // Start the animation
        // Start the animation
      }
    }, 1000); // Delay for the first part of the image to show up

    return () => {
      clearTimeout(animationTimeout); // Clean up timer on unmount
    };
  }, []);

  useEffect(() => {
    if (isPartyTime) {
      setTimeout(() => {
        setIsPartyTime(false);
      }, 4000);
    }
  }, []);

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
          {isPartyTime && (
            <Confetti recycle={false} numberOfPieces={300} width={window.innerWidth} height={window.innerHeight} />
          )}
          <img src="/img/Congratulations.png" style={{ width: "850px", height: "170px" }} />
          <Title>
            {isCadet && (
              <>
                CADET TRAINING <br /> COMPLETED!
              </>
            )}
            {isRookie && (
              <>
                ROOKIE TRAINING <br /> COMPLETED!
              </>
            )}
          </Title>
          {isRookie && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "100px" }}>
              <RookieDepartment>
                <AnimatedRookieImage id="RookieImage">
                  <Img src={"/faction/Rookie.gif"} style={{ width: "350px" }} />
                  <div style={{ marginTop: "30px" }}>
                    {loading ? (
                      <Loading>Minting a Badge...</Loading>
                    ) : (
                      <>
                        {minted || (rookieNft && isRookie) || (cadetNft && isCadet) ? (
                          <Loading>Badge Minted!</Loading>
                        ) : (
                          <Focus
                            highlight={
                              tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart1["Mint NFT"]) ||
                              tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Repairs"])
                            }
                            present={
                              tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart1["Mint NFT"]) ||
                              tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Repairs"])
                            }
                          >
                            <img
                              style={{ cursor: "pointer", width: "120px", height: "50px" }}
                              src="../img/MintBadge.png"
                              onClick={async () => {
                                setIsPartyTime(true);
                                const params = new URLSearchParams(window.location.search);
                                const chainIdString = params.get("chainId");
                                setLoading(true);
                                try {
                                  const response = await fetch("https://api.giantleap.gg/api/tutorial-nft", {
                                    method: "POST",
                                    body: JSON.stringify({
                                      address: connectedAddress.get(),
                                      chainId: chainIdString && +chainIdString,
                                      nftContractAddress:
                                        (isRookie && "0xbAC949c145d7896085a90bD7B0F2333D0647D423") ||
                                        (isCadet && "0xE47118d4cD1F3f9FEEd93813e202364BEA8629b3"),
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
                          </Focus>
                        )}
                      </>
                    )}
                  </div>
                </AnimatedRookieImage>
                <Twitter>
                  <img
                    onClick={() => {
                      const text =
                        (isCadet &&
                          `I've just earned my Cadet Wings NFT for The Underverse MMORTS [@giantleapgg](https://twitter.com/giantleapgg)! \n\nThink you've got what it takes? \n\nGet one for yourself here and join me in the Underverse - https://tutorial.giantleap.gg/ \n\n #freenft #web3games`) ||
                        (isRookie &&
                          `I've just earned my Rookie Wings NFT for The Underverse MMORTS [@giantleapgg](https://twitter.com/giantleapgg)! \n\nThink you've got what it takes? \n\nGet one for yourself here and join me in the Underverse - https://tutorial.giantleap.gg/ \n\n #freenft #web3games`);
                      const twitterShareURL = "https://twitter.com/share?" + "text=" + encodeURIComponent(text || "");
                      console.log(twitterShareURL);
                      const popupWidth = 550;
                      const popupHeight = 420;
                      const left = window.screen.width / 2 - popupWidth / 2;
                      const top = window.screen.height / 2 - popupHeight / 2;
                      const popup = window.open(
                        twitterShareURL,
                        "pop",
                        "width=" + popupWidth + ",height=" + popupHeight + ",left=" + left + ",top=" + top
                      );

                      if (popup?.focus) {
                        popup.focus();
                      }

                      return false;
                    }}
                    src="../img/TweetBox.png"
                    style={{ marginLeft: "-60px", height: "95px", width: "320px" }}
                  />
                  <img src="../img/TwitterIcon.png" style={{ marginTop: "20px", width: "35px", height: "25px" }} />
                </Twitter>
              </RookieDepartment>
              <CadetDepartment>
                <AnimatedCadetImage id="CadetImage" src={"/faction/Cadet.gif"} style={{ width: "350px" }} />
                <Conquer
                  onClick={async () => {
                    if (isRookie) {
                      const nftDetails = getNftId(layers);
                      if (!nftDetails) {
                        return;
                      }
                      toast.promise(
                        async () => {
                          try {
                            await tutorial1CompleteSystem(nftDetails.tokenId);
                            input.enableInput();
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
                    } else if (isCadet) {
                      window.open("https://underverse.giantleap.gg/", "_blank");
                    }
                  }}
                >
                  {isRookie && minted ? (
                    <Focus
                      highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart1["Mint NFT"])}
                      present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart1["Mint NFT"])}
                    >
                      <img
                        src="/img/CadetTrainingButton.png"
                        style={{ cursor: "pointer", width: "200px", height: "60px" }}
                      />
                    </Focus>
                  ) : (
                    isRookie && (
                      <img
                        src="/img/CadetTrainingButton.png"
                        style={{ cursor: "pointer", width: "200px", height: "60px" }}
                      />
                    )
                  )}
                  {isCadet && minted ? (
                    <Focus
                      highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Repairs"])}
                      present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Repairs"])}
                    >
                      <Title>CONQUER THE UNDERVERSE</Title>
                    </Focus>
                  ) : (
                    <>{isCadet && <Title style={{ marginRight: "20px" }}>CONQUER THE UNDERVERSE</Title>}</>
                  )}
                </Conquer>
              </CadetDepartment>
            </div>
          )}
          {isCadet && (
            <div>
              <Img src={"/faction/CadetWingImg.png"} />
              <div style={{ marginTop: "20px" }}>
                {loading ? (
                  <Loading>Minting a Badge...</Loading>
                ) : (
                  <>
                    {minted || (rookieNft && isRookie) || (cadetNft && isCadet) ? (
                      <Loading>Badge Minted!</Loading>
                    ) : (
                      <Focus
                        highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Repairs"])}
                        present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Repairs"])}
                      >
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
                                  nftContractAddress:
                                    (isRookie && "0xbAC949c145d7896085a90bD7B0F2333D0647D423") ||
                                    (isCadet && "0xE47118d4cD1F3f9FEEd93813e202364BEA8629b3"),
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
                      </Focus>
                    )}
                  </>
                )}
                <Twitter>
                  <div style={{ display: "flex", alignContent: "center", justifyContent: "center", gap: "10px" }}>
                    <img
                      onClick={() => {
                        const text =
                          (isCadet &&
                            `I've just earned my Cadet Wings NFT for The Underverse MMORTS @giantleapgg! \n\nThink you've got what it takes? \n\nGet one for yourself here and join me in the Underverse - https://tutorial.giantleap.gg/`) ||
                          (isRookie &&
                            `I've just earned my Rookie Wings NFT for The Underverse MMORTS @giantleapgg! \n\nThink you've got what it takes? \n\nGet one for yourself here and join me in the Underverse - https://tutorial.giantleap.gg/`);
                        const twitterShareURL = "https://twitter.com/share?" + "text=" + encodeURIComponent(text || "");
                        console.log(twitterShareURL);
                        const popupWidth = 550;
                        const popupHeight = 420;
                        const left = window.screen.width / 2 - popupWidth / 2;
                        const top = window.screen.height / 2 - popupHeight / 2;
                        const popup = window.open(
                          twitterShareURL,
                          "pop",
                          "width=" + popupWidth + ",height=" + popupHeight + ",left=" + left + ",top=" + top
                        );

                        if (popup?.focus) {
                          popup.focus();
                        }

                        return false;
                      }}
                      src="../img/TweetBox.png"
                      style={{ marginLeft: "-60px", height: "120px", width: "350px" }}
                    />
                    <img src="../img/TwitterIcon.png" style={{ marginTop: "20px", width: "45px", height: "40px" }} />
                  </div>
                  {isCadet && (
                    <div
                      onClick={() => {
                        if (isCadet) {
                          window.open("https://underverse.giantleap.gg/", "_blank");
                        }
                      }}
                      style={{ position: "absolute", right: 0 }}
                    >
                      <Title style={{ marginRight: "20px" }}>CONQUER THE UNDERVERSE</Title>
                      <img src="../img/Conquer.png" style={{ marginRight: "20px" }} />
                    </div>
                  )}
                </Twitter>
                <Conquer
                  onClick={async () => {
                    if (isRookie) {
                      const nftDetails = getNftId(layers);
                      if (!nftDetails) {
                        return;
                      }
                      toast.promise(
                        async () => {
                          try {
                            await tutorial1CompleteSystem(nftDetails.tokenId);
                            input.enableInput();
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
                    } else if (isCadet) {
                      window.open("https://underverse.giantleap.gg/", "_blank");
                    }
                  }}
                >
                  {isRookie && minted ? (
                    <Focus
                      highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart1["Mint NFT"])}
                      present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart1["Mint NFT"])}
                    >
                      <Title>CONTINUE TO CADET TRAINING</Title>
                    </Focus>
                  ) : (
                    <>{isRookie && <Title style={{ marginRight: "20px" }}>CONTINUE TO CADET TRAINING</Title>}</>
                  )}
                </Conquer>
              </div>
            </div>
          )}
        </WalletText>
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

const slideLeftAnimation = keyframes`
  from {
    transform: translateX(50%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;
const slideRightAnimation = keyframes`
  from {
    transform: translateX(-50%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const AnimatedRookieImage = styled.div`
  width: 300px;
  height: 230px;
  animation: ${slideLeftAnimation} 1.2s ease-in-out; // Use the keyframe animation
`;

const AnimatedCadetImage = styled.img`
  width: 300px;
  height: 230px;
  animation: ${slideRightAnimation} 1.2s ease-in-out; // Use the keyframe animation
`;

const Img = styled.img`
  width: 300px;
  height: 230px;
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
  gap: 16px;
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
  font-size: 18px;
  color: #00fde4;
  letter-spacing: 0.9;
  line-height: 1.7;
  font-weight: bold;
  font-family: monospace;
`;

const RookieDepartment = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  gap: 55px;
  position: relative;
`;

const CadetDepartment = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 25px;
`;

const Twitter = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  justify-content: center;
  gap: 5px;
  margin-top: 45px;
  margin-bottom: 20px;
  cursor: pointer;
  width: 100%;
`;

const Conquer = styled.div`
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
          components: { SelectedNftID, ShowTutorialCompleteModal },
          localIds: { nftId, modalIndex },
        },
      } = layers;
      return merge(
        computedToStream(connectedAddress),
        ShowTutorialCompleteModal.update$,
        NFTID.update$,
        TutorialStep.update$,
        SelectedNftID.update$
      ).pipe(
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
            const modal = getComponentValue(ShowTutorialCompleteModal, modalIndex);
            if (number && (+number === 130 || +number === 250 || +number === 260) && !modal?.showModal) {
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
