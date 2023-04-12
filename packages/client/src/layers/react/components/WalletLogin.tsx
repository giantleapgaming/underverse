import { useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Wallet } from "ethers";
import { walletAddressLoginDisplay } from "../utils/walletAddress";

const WalletLogin = () => {
  const [output, setOutput] = useState("");
  const pkRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [input, setInput] = useState("");
  const allKeys = JSON.parse(localStorage.getItem("all-underverse-pk") ?? "[]");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enterInputKey, setEnterInputKey] = useState(false);
  const [playGame, setPlayGame] = useState(false);

  return (
    <Container>
      <RotatingGreenAsteroid src="../img/greenAsteroid.png" />
      <RotatingOrangeAsteroid src="/img/orangeAsteroid.png" />
      <RotatingResidential src="../img/residential.png" />
      <RotatingBlueAsteroid src="../img/blueAsteroid.png" />
      <RotatingHarvester src="/img/harvester.png" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (playGame) {
            window.location.reload();
            return;
          }
        }}
      >
        <WalletText>
          <div>
            <p style={{ margin: "0px", color: "wheat", marginBottom: "20px" }}>WELCOME TO</p>
            <img src="/img/title.png" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "3px",
                marginBottom: "50px",
              }}
            >
              <p style={{ margin: "0px", color: "wheat", marginBottom: "15px", fontSize: "30px" }}>TUTORIAL CAMPAIGN</p>
              <img src="../img/recruitTraining.png" style={{ width: "350px", height: "280px" }} />

              <iframe
                width="653"
                height="380"
                src="https://www.youtube.com/embed/6HDd5iflC8s?rel=0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
                style={{ zIndex: 20 }}
              />
              {loading ? (
                <p
                  style={{
                    fontSize: "20px",
                    color: "#fffdd5",
                    fontFamily: "sans-serif",
                    fontWeight: "bolder",
                    marginTop: "20px",
                    marginBottom: "20px",
                  }}
                >
                  Loading
                </p>
              ) : (
                <img
                  onClick={async () => {
                    const wallet = Wallet.createRandom();
                    try {
                      setLoading(true);
                      const params = new URLSearchParams(window.location.search);
                      const chainIdString = params.get("chainId");
                      const response = await fetch("https://api.giantleap.gg/api/drip-with-nft", {
                        method: "POST",
                        body: JSON.stringify({ address: wallet.address, chainId: chainIdString && +chainIdString }),
                        headers: {
                          "Content-Type": "application/json",
                        },
                      });
                      const data = await response.json();
                      if (data.status) {
                        sessionStorage.setItem("user-burner-wallet", wallet.privateKey);
                        if (!allKeys.includes(wallet.privateKey)) {
                          const newList = [...allKeys, wallet.privateKey];
                          localStorage.setItem("all-underverse-pk", JSON.stringify(newList));
                        }
                        window.location.reload();
                      } else {
                        setLoading(false);
                        setError("unexpected error");
                      }
                    } catch (e) {
                      console.log(e);
                      setError("unexpected error");
                      setLoading(false);
                    }
                  }}
                  src="../img/createAccount.png"
                  style={{ width: "180px", height: "70px", cursor: "pointer", marginTop: "15px" }}
                />
              )}
              <p
                style={{
                  fontSize: "20px",
                  color: "#fffdd5",
                  fontFamily: "sans-serif",
                  fontWeight: "bolder",
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
              >
                USE EXISTING <br /> ACCOUNT
              </p>
            </div>
            {!!allKeys.length && (
              <>
                {allKeys.map((pk: string, index: number) => {
                  const wallet = new Wallet(pk);
                  const address = wallet.address;
                  return (
                    <>
                      <CopyAddress address={address} index={index} pk={pk} />
                    </>
                  );
                })}
              </>
            )}
          </div>
        </WalletText>
        <InputBox>
          <P
            onClick={() => {
              setEnterInputKey(!enterInputKey);
            }}
          >
            Import Wallet Private Key{" "}
          </P>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "60px",
              marginBottom: "40px",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {enterInputKey && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                  <Input ref={pkRef} value={input} onChange={(e) => setInput(e.target.value)} />
                  <div>
                    <Button
                      type="submit"
                      onClick={() => {
                        setError("");
                        try {
                          const wallet = new Wallet(input);
                          const address = wallet.address;
                          sessionStorage.setItem("user-burner-wallet", input);
                          setOutput(`${output} \n $ wallet address - ${address} \n \n $ Press Enter to play the game`);
                          if (!allKeys.includes(wallet.privateKey)) {
                            const newList = [...allKeys, input];
                            localStorage.setItem("all-underverse-pk", JSON.stringify(newList));
                          }
                          setInput("");
                          setPlayGame(true);
                          setTimeout(() => {
                            buttonRef.current?.focus();
                          });
                        } catch (e) {
                          setError("Enter a valid private key");
                        }
                      }}
                    >
                      <img src="/button/enterNameBtn.png" style={{ width: "40px", height: "40px" }} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {error && enterInputKey && <Error>{error}</Error>}
          </div>
        </InputBox>
      </form>
    </Container>
  );
};

const CopyAddress = ({ address, index, pk }: { address: string; index: number; pk: string }) => {
  const [copy, setCopy] = useState(false);
  const [copyKey, setCopyKey] = useState(false);
  const [showActionName, setShowActionName] = useState({ copy: false, export: false });
  return (
    <>
      <div
        style={{
          position: "relative",
          marginTop: "-33px",
          marginLeft: "-50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "15px",
        }}
        key={address}
      >
        <span style={{ fontSize: "20px", color: "wheat", fontWeight: "bold", marginRight: "5px" }}></span>
        <AccountMenu>
          <p
            onClick={() => {
              sessionStorage.setItem("user-burner-wallet", pk);
              window.location.reload();
            }}
            style={{ cursor: "pointer" }}
          >
            {copy ? "Copied" : walletAddressLoginDisplay(address)}
          </p>
        </AccountMenu>
        <img src="/img/accBorderMenu.png" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            flexDirection: "column",
            marginBottom: "40px",
            marginTop: "10px",
          }}
        >
          <div
            style={{ cursor: "pointer", position: "relative" }}
            onMouseOver={() => {
              setShowActionName({ ...showActionName, copy: true });
            }}
            onMouseLeave={() => {
              setShowActionName({ ...showActionName, copy: false });
            }}
            onClick={() => {
              setCopy(true);
              navigator.clipboard.writeText(`${address}`);
              setTimeout(() => {
                setCopy(false);
              }, 1000);
            }}
          >
            <img src="/img/copy.png" />
            {showActionName.copy && (
              <p
                style={{ position: "absolute", bottom: "3px", width: "180px", color: "wheat", fontFamily: "MyOTFFont" }}
              >
                Copy address
              </p>
            )}
          </div>
          <div
            style={{ cursor: "pointer", position: "relative" }}
            onMouseEnter={() => {
              setShowActionName({ ...showActionName, export: true });
            }}
            onMouseLeave={() => {
              setShowActionName({ ...showActionName, export: false });
            }}
            onClick={() => {
              setCopyKey(true);
              navigator.clipboard.writeText(`${pk}`);
              setTimeout(() => {
                setCopyKey(false);
              }, 2000);
            }}
          >
            <img src="/img/exportKey.png" />
            {showActionName.export && (
              <p
                style={{
                  position: "absolute",
                  bottom: "3px",
                  left: "20px",
                  width: "200px",
                  color: "wheat",
                  fontFamily: "MyOTFFont",
                }}
              >
                {copyKey ? `${walletAddressLoginDisplay(pk)}` : "Export private key"}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
const Container = styled.div`
  width: 100%;
  height: 100vh;
  z-index: 50;
  background-image: url("/img/BG.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  pointer-events: all;
  overflow-y: auto;
  max-height: 100vh;
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
  right: 10%;
  top: 10%;
  animation: ${rotateAnimation} 10s linear infinite;
`;

const RotatingOrangeAsteroid = styled.img`
  position: absolute;
  left: 15%;
  top: 30%;
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
  right: 17%;
  width: 100px;
  animation: ${antiRotateAnimation} 20s linear infinite;
  transition: transform 10s ease-in-out;
  &:hover {
    transform: translateX(30%);
  }
`;

const RotatingHarvester = styled.img`
  position: absolute;
  bottom: 15%;
  right: 6%;
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
const P = styled.p`
  font-family: sans-serif;
  letter-spacing: 1;
  margin-bottom: 10px;

  &:hover {
    color: #00ffe6;
    cursor: pointer;
    scale: 1.05;
  }
`;
const AccountMenu = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #fffdd5;
  font-weight: 300;
  font-size: 20px;
  top: 20px;
  left: 40px;
  z-index: 5;
`;
const Error = styled.p`
  color: #ef0909;
  margin-top: 10px;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 20px;
`;

const InputBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  margin: 0 auto;
  font-size: 16px;
  color: #fffdd5;
  font-weight: 600;
`;
const Input = styled.input`
  font-size: 16px;
  border: none;
  outline: none;
  margin: 0 auto;
  background-color: transparent;
  color: #fffdd5;
  font-weight: 600;
  padding-top: 10px;
  padding-bottom: 5px;
  padding-left: 15px;
  padding-right: 10px;
  width: 330px;
  background-image: url("/button/enterNameInput.png");
  background-size: cover;
  background-repeat: no-repeat;
`;
const Button = styled.button`
  font-size: 18px;
  padding: 0;
  color: #fffdd5;
  font-weight: bold;
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
  &:hover {
    scale: 1.1;
  }
`;
export default WalletLogin;
