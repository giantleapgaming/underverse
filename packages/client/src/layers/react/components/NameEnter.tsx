import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { useState, useEffect } from "react";
import { computedToStream } from "@latticexyz/utils";
import { Faction } from "./Faction";
import { Wallet } from "ethers";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";

interface Image {
  tokenId: number;
  imageUrl: string;
}

const NameEnter = ({ layers }: { layers: Layers }) => {
  const [name, setName] = useState("");
  const [selectFaction, setSelectFaction] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<Image | null>(null);
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
            nftContract: "0x39Af9A4a49E18201FE0ED60C353039ac86B14fBD",
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
  return (
    <>
      <Container faction={!!(typeof selectFaction === "number")}>
        {"4242" == chainIdString ? (
          <>
            {typeof selectFaction === "number" ? (
              <>
                <Gif>
                  <img src="/img/nameSun.gif" />
                </Gif>
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
                      <S.NFTImages>
                        {nftData.map((item) => {
                          return (
                            <S.SelectNft
                              style={{
                                position: "relative",
                                opacity: item.imageUrl === selectedNFT?.imageUrl ? 1 : 0.5,
                              }}
                              onClick={() => setSelectedNFT(item)}
                              key={item.imageUrl}
                            >
                              {item.imageUrl === selectedNFT?.imageUrl && (
                                <span
                                  style={{
                                    position: "absolute",
                                    inset: "0px",
                                    fontSize: "60px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                  }}
                                >
                                  &#10003;
                                </span>
                              )}
                              <img src={item.imageUrl} />
                            </S.SelectNft>
                          );
                        })}
                      </S.NFTImages>
                    ) : (
                      <p style={{ alignItems: "center" }}>Loading NFT</p>
                    )}
                    {selectedNFT && (
                      <S.Inline>
                        <div>
                          <p style={{ marginLeft: "34px", color: "#05f4f9", marginBottom: "5px" }}>Enter Name</p>
                          <Input
                            disabled={loading}
                            onChange={(e) => {
                              setName(e.target.value);
                            }}
                            value={name}
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
  SelectNft: styled.div`
    cursor: pointer;
    width: 64px;
    height: 64px;
    &:hover {
      background-color: #eeeeee11;
      border-radius: 10%;
      scale: 1.1;
      opacity: 1 !important;
    }
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

const Gif = styled.div`
  z-index: 100;
  width: 200px;
  height: 100%;
  display: flex;
  bottom: 200;
  margin: auto auto;
  position: absolute;
  align-items: flex-end;
  justify-content: center;
`;

const Container = styled.div<{ faction: boolean }>`
  width: 100%;
  height: 100%;
  z-index: 50;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: ${({ faction }) => (faction ? "url(/img/bgUv.png)" : "url(/img/bgWithoutSkyLines.png)")};
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
  margin-top: 29px;
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
