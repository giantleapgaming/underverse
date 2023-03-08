import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { useState } from "react";
import { Faction } from "./Faction";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Nft } from "./Nft";

const NameEnter = ({ layers }: { layers: Layers }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const chainIdString = params.get("chainId");

  const {
    network: {
      api: { initSystem },
      network: { connectedAddress },
    },
    phaser: {
      sounds,
      localApi: { setNftId },
      components: { SelectedNftID },
      localIds: { stationDetailsEntityIndex },
    },
  } = layers;
  const selectedId = getComponentValue(SelectedNftID, stationDetailsEntityIndex)?.selectedNftID;
  return (
    <>
      <Container>
        {"4242" == chainIdString || "100" == chainIdString ? (
          <>
            {step === 1 && (
              <Form
                onSubmit={async (e) => {
                  e.preventDefault();
                  sounds["click"].play();
                  setStep(2);
                }}
              >
                <div>
                  <Nft
                    setSelectNft={(selectNft) => {
                      console.log(selectNft);
                      if (selectNft?.tokenId) {
                        setNftId(selectNft?.tokenId);
                      }
                    }}
                    selectedNFT={selectedId}
                    clickSound={() => {
                      sounds["click"].play();
                    }}
                    address={connectedAddress.get()}
                  />
                  {selectedId && (
                    <S.Inline>
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
                      <Button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "GO"}
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
                    try {
                      setLoading(true);
                      await initSystem(name, selectFaction, selectedId);
                    } catch (e) {
                      setLoading(false);
                      console.log("Error", e);
                    }
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
      </Container>
    </>
  );
};
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
  border: 2px #05f4f9 solid;
  font-size: 20px;
  color: #05f4f9;
  padding: 10px 20px;
  font-weight: 800;
  border-radius: 50%;
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
        },
        phaser: {
          components: { SelectedNftID },
          localIds: { stationDetailsEntityIndex },
        },
      } = layers;
      return merge(NFTID.update$, SelectedNftID.update$).pipe(
        map(() => {
          const nftId = getComponentValue(SelectedNftID, stationDetailsEntityIndex)?.selectedNftID;
          const allNftsEntityIds = [...getComponentEntities(NFTID)];
          console.log(nftId, allNftsEntityIds);
          const doesNftExist = allNftsEntityIds.some((entityId) => {
            const selectedNft = getComponentValueStrict(NFTID, entityId).value;
            return selectedNft === nftId;
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
