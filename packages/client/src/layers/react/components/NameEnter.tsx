import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { useState } from "react";
import { Faction } from "./Faction";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Nft } from "./Nft";
import { computedToStream } from "@latticexyz/utils";
import { toast } from "sonner";
import { keyframes } from "styled-components";

const NameEnter = ({ layers }: { layers: Layers }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [reactNftId, setReactNftId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const chainIdString = params.get("chainId");
  const [displayName, setDisplayName] = useState("");
  const [showBuildingMap, setBuildingMap] = useState(false);

  const {
    network: {
      api: { initSystem },
      network: { connectedAddress },
      components: { Name, NFTID },
    },
    phaser: {
      sounds,
      localApi: { setNftId },
      components: { SelectedNftID },
      localIds: { nftId },
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const selectedId = getComponentValue(SelectedNftID, nftId)?.selectedNftID;
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
        {!showBuildingMap ? (
          <>
            {"4242" == chainIdString || "100" == chainIdString ? (
              <>
                {step === 1 && (
                  <Form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      sounds["click"].play();
                      if (reactNftId) {
                        setNftId(reactNftId);
                        setStep(2);
                      }
                    }}
                  >
                    <div>
                      <Nft
                        setSelectNft={(selectNft) => {
                          if (selectNft?.tokenId) {
                            const allNameEntities = [...getComponentEntities(Name)];
                            allNameEntities.find((entity) => {
                              const name = getComponentValueStrict(Name, entity)?.value;
                              const nftId = getComponentValueStrict(NFTID, entity).value;
                              if (+nftId === selectNft?.tokenId) {
                                setDisplayName(name);
                              }
                            });
                            setReactNftId(selectNft?.tokenId);
                          }
                        }}
                        selectedNFT={reactNftId}
                        clickSound={() => {
                          sounds["click"].play();
                        }}
                        address={connectedAddress.get()}
                      />
                      {typeof reactNftId === "number" && (
                        <S.Inline>
                          {displayName ? (
                            <div>
                              <Input disabled value={displayName} />
                            </div>
                          ) : (
                            <div>
                              <Input
                                disabled={loading}
                                onChange={(e) => {
                                  setName(e.target.value);
                                }}
                                value={name}
                                placeholder="ENTER NAME"
                              />
                            </div>
                          )}
                          <Button type="submit" disabled={loading}>
                            <img src="/button/enterNameBtn.png" />
                          </Button>
                        </S.Inline>
                      )}
                    </div>
                  </Form>
                )}
                {step === 2 && (
                  <Faction
                    setSelectFaction={async (selectFaction) => {
                      if (name && selectedId && typeof selectFaction === "number") {
                        setBuildingMap(true);
                        toast.promise(
                          async () => {
                            try {
                              setLoading(true);
                              await initSystem(name, selectFaction, selectedId);
                            } catch (e: any) {
                              setBuildingMap(false);
                              throw new Error(e?.reason.replace("execution reverted:", "") || e.message);
                            }
                          },
                          {
                            loading: "Transaction in progress",
                            success: `Transaction successful`,
                            error: (e) => e.message,
                          }
                        );
                      }
                    }}
                    clickSound={() => {
                      sounds["click"].play();
                    }}
                  />
                )}
              </>
            ) : (
              <p>Chain Id not supported it will only work on lattice chain that is 4242</p>
            )}
          </>
        ) : (
          <div
            style={{ height: "100%", width: "100%", alignItems: "center", display: "flex", justifyContent: "center" }}
          >
            <S.Loader />
          </div>
        )}
      </Container>
    </>
  );
};
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const S = {
  NFTImages: styled.div`
    display: flex;
    max-width: 400px;
    flex-wrap: wrap;
    gap: 10px;
  `,
  Inline: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  `,
  Loader: styled.span`
    width: 48px;
    height: 48px;
    border: 3px solid #fff;
    border-radius: 50%;
    display: inline-block;
    position: relative;
    box-sizing: border-box;
    animation: ${rotate} 1s linear infinite;

    &::after {
      content: "";
      box-sizing: border-box;
      position: absolute;
      left: 0;
      top: 0;
      background: #ff3d00;
      width: 16px;
      height: 16px;
      transform: translate(-50%, 50%);
      border-radius: 50%;
    }
  `,
};
const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  z-index: 200;
`;

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

const Button = styled.button`
  outline: none;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const Input = styled.input`
  background: url("/img/nameInput.png");
  font-size: 30px;
  padding: 5px 20px;
  color: white;
  font-weight: 900;
  background-repeat: no-repeat;
  border: none;
  outline: none;
  width: 160px;

  ::placeholder {
    font-family: sans-serif;
    font-weight: bold;
    text-align: center;
    font-size: 16px;
    padding: 10px;
    color: #05f4f9;
  }
`;

export const registerNameScreen = () => {
  registerUIComponent(
    "NameScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          components: { NFTID },
          network: { connectedAddress },
        },
        phaser: {
          components: { SelectedNftID },
          localIds: { nftId },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const selectedNftId = getComponentValue(SelectedNftID, nftId)?.selectedNftID;
          const allNftsEntityIds = [...getComponentEntities(NFTID)];
          const doesNftExist = allNftsEntityIds.some((entityId) => {
            const selectedNft = getComponentValueStrict(NFTID, entityId).value;
            return +selectedNft === selectedNftId;
          });
          if (doesNftExist) {
            return;
          } else {
            return { layers };
          }
        })
      );
    },
    ({ layers }) => {
      return <NameEnter layers={layers} />;
    }
  );
};
