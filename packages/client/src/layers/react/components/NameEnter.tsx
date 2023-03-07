import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { useState, useEffect } from "react";
import { computedToStream } from "@latticexyz/utils";
import { Faction } from "./Faction";
import { Wallet } from "ethers";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { Nft } from "./Nft";

interface Image {
  tokenId: number;
  imageUrl: string;
}

const NameEnter = ({ layers }: { layers: Layers }) => {
  const [name, setName] = useState("");
  const [selectFaction, setSelectFaction] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<Image | undefined>();
  const [nftData, setNftData] = useState<Image[]>([]);
  const params = new URLSearchParams(window.location.search);
  const chainIdString = params.get("chainId");

  const {
    network: {
      api: { initSystem },
    },
    phaser: { sounds },
  } = layers;
  useEffect(() => {
    callApi();
  }, []);

  async function callApi() {
    try {
      const privateKey = sessionStorage.getItem("user-burner-wallet");
      if (privateKey) {
        const wallet = new Wallet(privateKey);
        const response = await fetch("https://api.giantleap.gg/api/user-nfts", {
          method: "POST",
          body: JSON.stringify({
            address: wallet.address,
            nftContract: "0x5e42fCbB2583CcaD0BaAfb92078b156bd661B93C",
            chainId: chainIdString,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.status) {
          setNftData(data.nftData.userWalletNftData);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  console.log("nftData.length: ", nftData.length, { nftData });
  return (
    <>
      <Container faction={!!(typeof selectFaction === "number")}>
        {"4242" == chainIdString || "100" == chainIdString ? (
          <>
            {typeof selectFaction === "number" ? (
              <>
                <Form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    sounds["click"].play();
                    if (name && selectedNFT && typeof selectFaction === "number") {
                      try {
                        setLoading(true);
                        await initSystem(name, selectFaction, selectedNFT?.tokenId);
                      } catch (e) {
                        setLoading(false);
                        console.log("Error", e);
                      }
                    }
                  }}
                >
                  <div>
                    {nftData.length ? (
                      <Nft
                        setSelectNft={setSelectedNFT}
                        nftData={nftData}
                        selectedNFT={selectedNFT}
                        clickSound={() => {
                          sounds["click"].play();
                        }}
                      />
                    ) : (
                      <p style={{ alignItems: "center" }}>no NFT</p>
                    )}
                    {selectedNFT && (
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
              </>
            ) : (
              <Faction
                setSelectFaction={setSelectFaction}
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
  position: absolute;
  bottom: 20px;
  z-index: 200;
`;

const Container = styled.div<{ faction: boolean }>`
  width: 100%;
  height: 100vh;
  z-index: 50;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url("/img/bgWithoutSkyLines.png");
  /* background-image: ${({ faction }) => (faction ? "url(/img/bgUv.png)" : "url(/img/bgWithoutSkyLines.png)")}; */
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
          network: { connectedAddress },
          components: { NFTID },
          walletNfts,
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const allNftIds = [...getComponentEntities(NFTID)].map((nftId) => {
            return +getComponentValueStrict(NFTID, nftId).value;
          });
          const doesExist = walletNfts.some((walletNftId) => allNftIds.includes(walletNftId.tokenId));
          if (doesExist) {
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
