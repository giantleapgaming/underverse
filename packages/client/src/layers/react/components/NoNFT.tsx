import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { walletAddressLoginDisplay } from "../utils/walletAddress";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { toast } from "sonner";
import { PolygonToL2NftBridge } from "./bridge/PolygonToL2NftBridge";
import { BridgeButton } from "./BridgeButton";
import { L2ToPolygonNftBridge } from "./bridge/L2ToPolygonNftBridge";
import { useL1AllNFT } from "../hooks/useL1AllNFT";
import { Image } from "./Nft";
import { usePolygonIdNFTData } from "../hooks/usePolygonIdNFTData";
export const NoNFT = ({
  address,
  totalNft,
  setShowNftBridge,
}: {
  address?: string;
  totalNft: number;
  setShowNftBridge: (value: boolean) => void;
}) => {
  const [copy, setCopy] = useState(false);
  const { allNfts: l1AllNfts, error: l1NftError, loading: l1NftLoading } = useL1AllNFT(address);
  const [copyKey, setCopyKey] = useState(false);
  const {
    allNfts: polygonNft,
    error: ploygonNftError,
    loading: polygonNftLoading,
    setCurrentAccount,
  } = usePolygonIdNFTData();
  const [privateKeyButton, setPrivateKeyButton] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [connectNFTBridge, setConnectNFTBridge] = useState(false);
  const [selectedNft, setSelectedNft] = useState<Image>();
  const [metaMaskAccount, setMetamaskAccount] = useState<string | undefined>();
  const [swap, setSwap] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState(false);
  const connectAccount = async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore //
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = await detectEthereumProvider();
      if (!provider) {
        toast.error("Please install MetaMask to bridge the NFT");
        return;
      }
      const ethProvider = new ethers.providers.Web3Provider(provider);
      const polygonProvider = new ethers.providers.JsonRpcProvider(
        "https://polygon-mainnet.g.alchemy.com/v2/g4Z3TxhdJXDADVIOxRru9Pxyt4fK2942"
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore //
      const networkId = await window.ethereum.networkVersion;
      if (networkId !== "137") {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore //
        await window.ethereum
          .request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ethers.utils.hexlify(137) }],
          })
          .then(() => {
            console.log("network has been set");
            setLoading(false);
          })
          .catch((e) => {
            if (e.code === 4902) {
              console.log("network is not available, add it");
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore //
              window.ethereum
                .request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: ethers.utils.hexlify(137),
                      chainName: "Polygon",
                      nativeCurrency: {
                        name: "MATIC",
                        symbol: "MATIC",
                        decimals: 18,
                      },
                      rpcUrls: ["https://polygon-rpc.com"],
                      blockExplorerUrls: ["https://www.polygonscan.com"],
                    },
                  ],
                })
                .then(() => {
                  console.log("network added");
                  setLoading(false);
                })
                .catch(() => {
                  toast.error("Could not add network");
                  return false;
                });
            } else {
              toast.error("Could not set network");
            }
          });
      }

      // const signer = polygonProvider.getSigner();
      const signer = ethProvider.getSigner();
      const signerAddress = await signer.getAddress();
      if (signerAddress) {
        setMetamaskAccount(signerAddress);
        setCurrentAccount(signerAddress);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", position: "absolute", right: "30px", top: "30px" }}>
        <S.ButtonImg
          onClick={() => {
            try {
              sessionStorage.removeItem("user-burner-wallet");
              window.location.reload();
            } catch (e) {
              console.log(e);
            }
          }}
          src="/button/greenButton.png"
        />
        <S.DeployText
          onClick={() => {
            try {
              sessionStorage.removeItem("user-burner-wallet");
              window.location.reload();
            } catch (e) {
              console.log(e);
            }
          }}
        >
          {address?.toString().substring(0, 6)}
        </S.DeployText>
      </div>
      <S.Container>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/img/title.png" style={{ marginTop: "20px" }} />
        </div>
        {connectNFTBridge || totalNft ? (
          <div>
            <p
              style={{
                textAlign: "center",
                fontSize: "32px",
                fontFamily: "sans-serif",
                letterSpacing: "1.4",
                fontWeight: "700",
                color: "#FFFDD5",
                padding: "0",
                margin: "30px 0",
              }}
            >
              NFT BRIDGE
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ol
                style={{
                  fontSize: "14px",
                  fontFamily: "sans-serif",
                  letterSpacing: "1.3",
                  fontWeight: "300",
                  color: "#FFFDD5",
                  padding: "0",
                  margin: "30px 0 50px",
                }}
              >
                <li>
                  <span
                    onClick={connectAccount}
                    style={{ cursor: "pointer", textDecorationLine: "underline", fontWeight: 700 }}
                  >
                    Connect
                  </span>{" "}
                  your MetaMask and select your account which you used to mint the Genesis NFT
                </li>
                <li>Click BRIDGE and approve transactions to bridge your NFT to your in-game wallet</li>
                <li>
                  It may take up to 10 minutes for the bridging to complete. The screen will auto refresh on completion
                </li>
                <li>Export the private key for your in-game wallet and add to your MetaMask</li>
              </ol>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (selectedNft) {
                    setSelectedNft(undefined);
                    return;
                  } else if (connectNFTBridge) {
                    setConnectNFTBridge(false);
                  } else {
                    setShowNftBridge(false);
                  }
                }}
              >
                <img src="/img/back.png" />
                <p>Back</p>
              </div>
              <S.GetNFTBox>
                {selectedNft ? (
                  <div>
                    <S.NFTBox onClick={() => setConnectNFTBridge(true)}>
                      <img src={selectedNft?.imageUrl} width="200" />
                    </S.NFTBox>
                    <p
                      style={{
                        fontSize: "21px",
                        fontFamily: "monospace",
                        letterSpacing: "1.1",
                        fontWeight: "300",
                        marginTop: "5px",
                        color: "#FFFDD5",
                      }}
                    >
                      {!swap ? "NFTs on Polygon" : "NFTs on Game"}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "30px" }}>
                    <div style={{ flex: 1 }}>
                      {/* <p>NFTs on game</p>
                      <S.NftSelectionContainer>
                        {l1AllNfts?.map((data, index) => (
                          <S.NftSelect
                            selectedNFT={false}
                            key={`index-${index}`}
                            onClick={() => {
                              setSwap(true);
                              setSelectedNft(data);
                            }}
                          >
                            <S.Img src={data.imageUrl} />
                          </S.NftSelect>
                        ))}
                        {l1AllNfts?.length === 0 && <div>No Nft</div>}
                      </S.NftSelectionContainer> */}
                      {!metaMaskAccount ? (
                        <S.ConnectAccount onClick={connectAccount}>
                          <p style={{ fontSize: "30px", textAlign: "center", fontWeight: "bold", padding: "20px" }}>
                            CLICK HERE TO CONNECT YOUR METAMASK TO DETECT YOUR NFTS ON POLYGON
                          </p>
                        </S.ConnectAccount>
                      ) : (
                        <>
                          {swap ? (
                            <S.NftSelectionContainer>
                              <p style={{ textAlign: "center", fontSize: "30px" }}>
                                Connected to
                                <br />
                                {metaMaskAccount?.toString().substring(0, 10)}...
                                <br />
                                <br />
                                {l1AllNfts?.length} NFTs Detected
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexWrap: "wrap",
                                  gap: "10px",
                                }}
                              >
                                {l1NftLoading && <Loader />}
                                {!l1NftLoading &&
                                  l1AllNfts?.map((data, index) => (
                                    <S.NftSelect
                                      selectedNFT={false}
                                      key={`index-${index}`}
                                      onClick={() => {
                                        setSwap(true);
                                        setSelectedNft(data);
                                      }}
                                    >
                                      <S.Img src={data.imageUrl} width={100} height={100} />
                                    </S.NftSelect>
                                  ))}
                              </div>
                              {l1AllNfts?.length === 0 && <div>No Nft</div>}
                              {l1NftError && <div>Error Unable to load the Nft</div>}
                            </S.NftSelectionContainer>
                          ) : (
                            <S.NftSelectionContainer>
                              <p style={{ textAlign: "center", fontSize: "30px" }}>
                                Connected to
                                <br />
                                {metaMaskAccount?.toString().substring(0, 10)}...
                                <br />
                                <br />
                                {polygonNft?.length} NFTs Detected
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexWrap: "wrap",
                                  gap: "10px",
                                }}
                              >
                                {polygonNftLoading && <Loader />}
                                {!polygonNftLoading &&
                                  polygonNft?.map((data, index) => (
                                    <S.NftSelect
                                      selectedNFT={false}
                                      key={`index-${index}`}
                                      onClick={() => {
                                        setSwap(false);
                                        setSelectedNft(data);
                                      }}
                                    >
                                      <S.Img src={data.imageUrl} width={100} height={100} />
                                    </S.NftSelect>
                                  ))}
                              </div>
                              {polygonNft?.length === 0 && <div>No Nft</div>}
                              {ploygonNftError && <div>Error Unable to load the Nft</div>}
                            </S.NftSelectionContainer>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
                {!success ? (
                  <S.BridgeFromPolygonBox>
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: "16px",
                        fontFamily: "monospace",
                        letterSpacing: "1.1",
                        fontWeight: "bolder",
                      }}
                    >
                      BRIDGE YOUR GENESIS NFT <br /> FROM {!swap ? "POLYGON" : "GAME"} TO THE{" "}
                      {swap ? "POLYGON" : "GAME"}
                    </p>
                    {!swap ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: "1px",
                        }}
                      >
                        <img src="/img/polygon.png" style={{ width: "300px", height: "55px", cursor: "pointer" }} />
                        <p
                          style={{
                            fontSize: "14px",
                            fontFamily: "monospace",
                            fontWeight: "400",
                            letterSpacing: "1.1",
                            alignSelf: "flex-start",
                            marginLeft: "10px",
                          }}
                        >
                          MM ACCOUNT: {metaMaskAccount?.toString().substring(0, 10)}...
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: "1px",
                          marginLeft: "10px",
                        }}
                      >
                        <img src="/img/underverse.png" style={{ width: "300px", height: "55px", cursor: "pointer" }} />
                        <p
                          style={{
                            fontSize: "14px",
                            fontFamily: "monospace",
                            fontWeight: "400",
                            letterSpacing: "1.1",
                            alignSelf: "flex-start",
                            marginLeft: "5px",
                          }}
                        >
                          GAME ACCOUNT: {address?.toString().substring(0, 10)}...
                        </p>
                      </div>
                    )}
                    <img
                      onClick={() => {
                        setSelectedNft(undefined);
                        setSwap(!swap);
                      }}
                      src="/img/switch.png"
                      style={{ width: "35px", height: "42px", cursor: "pointer" }}
                    />
                    {!swap ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: "1px",
                          marginLeft: "10px",
                        }}
                      >
                        <img src="/img/underverse.png" style={{ width: "300px", height: "55px", cursor: "pointer" }} />
                        <p
                          style={{
                            fontSize: "14px",
                            fontFamily: "monospace",
                            fontWeight: "400",
                            letterSpacing: "1.1",
                            alignSelf: "flex-start",
                            marginLeft: "5px",
                          }}
                        >
                          GAME ACCOUNT: {address?.toString().substring(0, 10)}...
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: "1px",
                        }}
                      >
                        <img src="/img/polygon.png" style={{ width: "300px", height: "55px", cursor: "pointer" }} />
                        <p
                          style={{
                            fontSize: "14px",
                            fontFamily: "monospace",
                            fontWeight: "400",
                            letterSpacing: "1.1",
                            alignSelf: "flex-start",
                            marginLeft: "10px",
                          }}
                        >
                          MM ACCOUNT: {metaMaskAccount?.toString().substring(0, 10)}...
                        </p>
                      </div>
                    )}
                    {metaMaskAccount ? (
                      <BridgeButton
                        isLoading={loading}
                        onClick={async () => {
                          try {
                            setLoading(true);
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore //
                            await window.ethereum.request({ method: "eth_requestAccounts" });
                            const provider = await detectEthereumProvider();
                            if (!provider) {
                              toast.error("Please install MetaMask to bridge the NFT");
                              return;
                            }
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore //
                            const networkId = await window.ethereum.networkVersion;
                            if (networkId !== "137") {
                              toast.error("Please set network to Polygon in your metamask");
                              setLoading(false);
                            } else {
                              const ethProvider = new ethers.providers.Web3Provider(provider);
                              const polygonProvider = new ethers.providers.JsonRpcProvider(
                                "https://polygon-mainnet.g.alchemy.com/v2/g4Z3TxhdJXDADVIOxRru9Pxyt4fK2942"
                              );
                              const signer = ethProvider.getSigner();
                              // const signer = polygonProvider.getSigner();
                              const privateKey = sessionStorage.getItem("user-burner-wallet");
                              if (privateKey && selectedNft) {
                                if (!swap) {
                                  await PolygonToL2NftBridge(signer, privateKey, selectedNft.tokenId, () =>
                                    setSuccess(true)
                                  );
                                  setLoading(false);
                                } else {
                                  await L2ToPolygonNftBridge(signer, privateKey, selectedNft.tokenId, () =>
                                    setSuccess(true)
                                  );
                                  setLoading(false);
                                }
                              }
                            }
                          } catch (e) {
                            setLoading(false);
                            console.log(e);
                          }
                        }}
                      >
                        {loading ? <Loader /> : "Bridge"}
                      </BridgeButton>
                    ) : (
                      <BridgeButton isLoading={loading} onClick={connectAccount}>
                        {loading ? "Connecting" : "Connect"}
                      </BridgeButton>
                    )}
                  </S.BridgeFromPolygonBox>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "30px" }}>
                    <S.BridgeFromPolygonBox>
                      <p
                        style={{
                          textAlign: "center",
                          fontSize: "24px",
                          fontFamily: "monospace",
                          letterSpacing: "1.1",
                          fontWeight: "bolder",
                          color: "#6e25b0",
                        }}
                      >
                        NFT
                        <br />
                        SUCCESSFULLY
                        <br />
                        BRIDGED!
                        <br />
                      </p>
                      <p
                        style={{
                          textAlign: "center",
                          fontSize: "16px",
                          fontFamily: "monospace",
                          letterSpacing: "1.1",
                          padding: "10px",
                        }}
                      >
                        Add your in-game account to MetaMask to ensure you always have access.
                      </p>

                      <p
                        style={{
                          textAlign: "center",
                          fontSize: "16px",
                          fontFamily: "monospace",
                          letterSpacing: "1.1",
                          padding: "10px",
                          fontWeight: "bolder",
                        }}
                      >
                        Click here to export your private key.
                      </p>
                      {address && (
                        <div
                          onClick={() => {
                            setCopy(true);
                            navigator.clipboard.writeText(`${privateKey}`);
                            setTimeout(() => {
                              setCopy(false);
                            }, 1000);
                          }}
                          style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "20px" }}
                        >
                          <p>{walletAddressLoginDisplay(address)}</p>
                          <img
                            src="/img/copy.png"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setCopy(true);
                              navigator.clipboard.writeText(`${privateKey}`);
                              setTimeout(() => {
                                setCopy(false);
                              }, 1000);
                            }}
                          />
                        </div>
                      )}
                    </S.BridgeFromPolygonBox>
                    <div style={{ cursor: "pointer" }} onClick={() => setShowNftBridge(false)}>
                      <img src="/img/next.png" />
                      <p>Continue To Game </p>
                    </div>
                  </div>
                )}
              </S.GetNFTBox>
            </div>
          </div>
        ) : (
          <div>
            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                fontFamily: "sans-serif",
                letterSpacing: "1",
                fontWeight: "600",
                color: "white",
                padding: "0",
                margin: "20px 0",
              }}
            >
              {totalNft} UNDERVERSE NFTS DETECTED
            </p>
            <S.GetNFTBox>
              <S.BridgeBox onClick={() => setConnectNFTBridge(true)}>
                <S.Text>
                  {" "}
                  BRIDGE YOUR GENESIS NFT <br /> FROM POLYGON
                </S.Text>
                <S.NftTextImg src="/img/genesisNft.png" />
              </S.BridgeBox>
              <S.BridgeBox
                onClick={() => {
                  window.open("https://discord.com/invite/2YxDpucg8Y", "_blank");
                }}
              >
                <S.Text>
                  {" "}
                  REQUEST A GAMEPASS FROM <br /> DISCORD
                </S.Text>
                <S.NftTextImg src="/img/gamepassDiscord.png" />
              </S.BridgeBox>
            </S.GetNFTBox>
          </div>
        )}
        <S.AddressBox>
          <p
            style={{
              textAlign: "center",
              fontSize: "22px",
              fontFamily: "MyOTFFont",
              letterSpacing: "1.2",
              fontWeight: "600",
              color: "white",
              padding: "0",
              margin: "10px 0",
            }}
          >
            IN-GAME WALLET ADDRESS:{" "}
            {(copy && (copy ? "Wallet Address Copied" : address && walletAddressLoginDisplay(address))) ||
              (copyKey && (copyKey ? "Private Key Copied" : address && walletAddressLoginDisplay(address))) ||
              (address && walletAddressLoginDisplay(address))}
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
            <img
              src="/img/copy.png"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setCopy(true);
                navigator.clipboard.writeText(`${address}`);
                setTimeout(() => {
                  setCopy(false);
                }, 1000);
              }}
            />
            <img
              src="/img/exportKey.png"
              style={{ cursor: "pointer" }}
              onClick={() => {
                try {
                  const data = sessionStorage.getItem("user-burner-wallet");
                  setCopyKey(true);
                  data ? setPrivateKeyButton(data) : setPrivateKeyButton("");
                  navigator.clipboard.writeText(privateKeyButton);
                  setTimeout(() => {
                    setCopyKey(false);
                  }, 1000);
                } catch (e) {
                  console.log(e);
                }
              }}
            />
          </div>
        </S.AddressBox>
        <S.Description>
          We recommend adding your in-game
          <br /> account to MetaMask.
          <br />{" "}
          <S.Span
            onClick={() => {
              try {
                const data = sessionStorage.getItem("user-burner-wallet");
                data ? setPrivateKey(data) : setPrivateKey("");
              } catch (e) {
                console.log(e);
              }
            }}
          >
            {privateKey ? `${privateKey}` : `Click here to export your private key.`}
          </S.Span>
        </S.Description>
      </S.Container>
      <S.DiscordImg
        onClick={() => {
          window.open("https://discord.com/invite/2YxDpucg8Y", "_blank");
        }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          marginTop: "12px",
          padding: "0px 0px 20px 0px",
        }}
      >
        <img src="/img/discordLogo.png" />
        <div style={{ fontSize: "12px", fontFamily: "sans-serif", fontWeight: "600", color: "wheat" }}>
          <p>Have questions?</p>
          <p>Reach out on Discord.</p>
        </div>
      </S.DiscordImg>
    </div>
  );
};

const S = {
  Container: styled.div`
    width: 100%;
    height: 100%;
    margin: 10px auto;
  `,

  Img: styled.img`
    width: 60px;
    object-fit: contain;
  `,

  ButtonImg: styled.img`
    margin: auto;
    width: 100%;
    cursor: pointer;
  `,

  DiscordImg: styled.div`
    position: absolute;
    right: 20;
    cursor: pointer;
  `,

  Button: styled.button`
    outline: none;
    border: none;
    background: transparent;
    cursor: pointer;
  `,
  NftSelectionContainer: styled.div`
    justify-content: center;
    flex-wrap: wrap;
    background-color: rgba(77, 25, 129, 0.6);
    border-radius: 15px;
    width: 370px;
    height: 390px;
    overflow-x: auto;
    padding: 20px;
  `,
  ConnectAccount: styled.div`
    cursor: pointer;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    background-color: rgba(77, 25, 129, 0.6);
    border-radius: 15px;
    width: 370px;
    height: 390px;
  `,
  DeployText: styled.p`
    position: absolute;
    top: 6px;
    right: 16px;
    font-size: 16;
    font-weight: bold;
    cursor: pointer;
  `,
  AddressBox: styled.div`
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;
  `,

  RecheckNFT: styled.div`
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
  `,

  Description: styled.p`
    text-align: center;
    font-size: 20px;
    font-family: "MyOTFFontBold";
    letter-spacing: 1.2;
    line-height: 1.4;
    color: white;
    padding: 0;
    margin: 20px 0;
  `,
  Span: styled.span`
    &:hover {
      color: #00ffe6;
      cursor: pointer;
      scale: 2;
    }
  `,

  GetNFTBox: styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 115px;
    margin-bottom: 40px;
  `,

  BridgeBox: styled.div`
    background: transparent;
    background-color: rgba(253, 249, 249, 0.1);
    border-radius: 35px;
    padding: 50px 25px;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 40px;
    cursor: pointer;
    &:hover {
      scale: 1.02;
    }
  `,

  NFTBox: styled.div`
    background: transparent;
    border-radius: 35px;
    width: 370px;
    height: 390px;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 40px;
  `,
  BridgeFromPolygonBox: styled.div`
    background-color: #ffffff;
    color: black;
    border-radius: 35px;
    width: 370px;
    height: 390px;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
    align-items: center;
  `,

  Text: styled.p`
    text-align: center;
    color: whitesmoke;
    font-size: 14px;
    letter-spacing: 1.4;
    font-weight: 100;
    line-height: 1.5;
    font-family: "MyOTFFont";
  `,
  NftSelect: styled.div<{ selectedNFT: boolean }>`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
    background-image: ${({ selectedNFT }) => {
      return selectedNFT ? "url(/img/BlueBorderNFT.png)" : "url(/img/WhiteBorderNFT.png)";
    }};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    width: 100px;
    height: 100px;

    &:hover {
      border-radius: 2%;
      scale: 1.05;
    }
  `,
  NftTextImg: styled.img`
    width: 220px;
    height: 90px;
  `,
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  animation: ${spin} 2s linear infinite;
`;
