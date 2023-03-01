import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Wallet } from "ethers";
import { walletAddressLoginDisplay } from "../utils/walletAddress";

const WalletLogin = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pkRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const allKeys = JSON.parse(localStorage.getItem("all-underverse-pk") ?? "[]");
  const [privateKey, setPrivetKey] = useState({ show: false, input: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [playGame, setPlayGame] = useState(false);

  useEffect(() => {
    if (!playGame) {
      inputRef?.current?.focus();
      pkRef?.current?.focus();
    }
  }, [privateKey]);

  return (
    <Container
      onClick={() => {
        if (!playGame) {
          inputRef?.current?.focus();
          pkRef?.current?.focus();
        }
      }}
    >
      <SkyBlueLines>
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
              <Title>
                <P style={{ margin: "0px" }}>WELCOME TO THE</P>
                <h1 style={{ fontWeight: "bold", fontStyle: "italic", fontSize: "80px" }}>UNDERVERSE</h1>
              </Title>
              <div>
                <P style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "18px" }}>
                  Create a New Account
                  <br />
                  or Use Existing
                </P>
              </div>
              <div>
                <P>
                  i. Import Wallet <br />
                  Private Key
                </P>
                <P style={{ marginBottom: "25px" }}>
                  n. Create New
                  <br /> Wallet
                </P>
              </div>

              {!!allKeys.length && (
                <>
                  <P style={{ marginBottom: "10px" }}>Existing Account/s</P>
                  {allKeys.map((pk: string, index: number) => {
                    const wallet = new Wallet(pk);
                    const address = wallet.address;
                    return <CopyAddress address={address} index={index} />;
                  })}
                </>
              )}
            </div>
          </WalletText>
          <TerminalOutput>{output}</TerminalOutput>
          <InputBox>
            {!playGame && !loading && <div style={{ marginRight: "10px", fontWeight: "bold" }}>INPUT |</div>}
            <div>
              {!privateKey.show && !playGame && !loading && (
                <Input
                  ref={inputRef}
                  value={input}
                  onKeyDown={async (e) => {
                    setError("");
                    if (e.key === "Enter") {
                      switch (input) {
                        case "i": {
                          setOutput(`${output} \n $ Enter the private key which as xDAI in it \n `);
                          setInput("");
                          setPrivetKey({ show: true, input: "" });
                          return;
                        }
                        case "n": {
                          const wallet = Wallet.createRandom();
                          try {
                            setLoading(true);
                            setOutput(`${output} \n $ Creating new wallet please wait  \n  Loading... \n`);
                            const response = await fetch("https://api.giantleap.gg/api/drip", {
                              method: "POST",
                              body: JSON.stringify({ address: wallet.address }),
                              headers: {
                                "Content-Type": "application/json",
                              },
                            });
                            const data = await response.json();
                            // if (data.status) {
                              sessionStorage.setItem("user-burner-wallet", wallet.privateKey);
                              setOutput(
                                `${output} \n $ New wallet address - ${wallet.address} \n \n $ Press Enter to play the game`
                              );
                              if (!allKeys.includes(wallet.privateKey)) {
                                const newList = [...allKeys, wallet.privateKey];
                                localStorage.setItem("all-underverse-pk", JSON.stringify(newList));
                              }
                              setPlayGame(true);
                              setTimeout(() => {
                                buttonRef.current?.focus();
                              });
                            // }
                          } catch (e) {
                            console.log(e);
                            setError("unexpected error");
                            setLoading(false);
                          }
                          return;
                        }
                      }
                      if (typeof +input === "number") {
                        const getWalletIndex = +input;
                        const privateKey = allKeys[getWalletIndex - 1];
                        if (privateKey) {
                          const wallet = new Wallet(privateKey);
                          const address = wallet.address;
                          sessionStorage.setItem("user-burner-wallet", privateKey);
                          setOutput(`${output} \n $ wallet address - ${address} \n \n $ Press Enter to play the game`);
                          setPlayGame(true);
                          setTimeout(() => {
                            buttonRef.current?.focus();
                          });
                        } else {
                          setError("Please Enter a valid Input");
                        }
                        return;
                      }
                    }
                  }}
                  onChange={(e) => setInput(e.target.value)}
                />
              )}
              {privateKey.show && (
                <Input
                  ref={pkRef}
                  value={privateKey.input}
                  onKeyDown={(e) => {
                    setError("");

                    if (e.key === "Enter") {
                      try {
                        const wallet = new Wallet(privateKey.input);
                        const address = wallet.address;
                        sessionStorage.setItem("user-burner-wallet", privateKey.input);
                        setOutput(`${output} \n $ wallet address - ${address} \n \n $ Press Enter to play the game`);
                        if (!allKeys.includes(wallet.privateKey)) {
                          const newList = [...allKeys, privateKey.input];
                          localStorage.setItem("all-underverse-pk", JSON.stringify(newList));
                        }
                        setPrivetKey({ show: false, input: "" });
                        setPlayGame(true);
                        setTimeout(() => {
                          buttonRef.current?.focus();
                        });
                      } catch (e) {
                        setError("Enter a valid private key");
                      }
                    }
                  }}
                  onChange={(e) => setPrivetKey({ show: true, input: e.target.value })}
                />
              )}
              {error && <Error>{error}</Error>}
              <Button ref={buttonRef} hidden={!playGame} type="submit">
                Enter &crarr;{" "}
              </Button>
            </div>
          </InputBox>
        </form>
      </SkyBlueLines>
    </Container>
  );
};

const CopyAddress = ({ address, index }: { address: string; index: number }) => {
  const [copy, setCopy] = useState(false);
  return (
    <P
      style={{ cursor: "pointer" }}
      key={address}
      onClick={() => {
        setCopy(true);
        navigator.clipboard.writeText(`${address}`);
        setTimeout(() => {
          setCopy(false);
        }, 1000);
      }}
    >
      {index + 1}. {copy ? "Copied" : address}
    </P>
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
`;

const SkyBlueLines = styled.div`
  width: 100%;
  height: 100%;
  z-index: 70;
  background-image: url("/img/BGblueLines.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  pointer-events: all;
  overflow: hidden;
`;
const hue = keyframes`
 from {
   -webkit-filter: hue-rotate(0deg);
 }
 to {
   -webkit-filter: hue-rotate(-360deg);
 }
`;

const Title = styled.div`
  color: #fffdd5;
  z-index: 60;
`;

const WalletText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 50px;
  margin: 60px auto 0;
  z-index: 100;
  letter-spacing: 1;
`;
const P = styled.p`
  color: #fffdd5;
  margin-top: 10px;
  font-weight: 300;
  font-size: 16px;
  margin-bottom: 10px;
`;
const Error = styled.p`
  color: #ef0909;
  margin-top: 10px;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 20px;
`;
const TerminalOutput = styled.div`
  color: #fffdd5;
  font-weight: 300;
  font-size: 16px;
  margin-bottom: 10px;
  white-space: pre-line;
  text-align: center;
`;

const InputBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #fffdd5;
`;
const Input = styled.input`
  margin-top: 30px;
  margin-right: 10px;
  font-size: 16px;
  border: none;
  outline: none;
  margin: 0;
  background-color: transparent;
  color: #fffdd5;
  font-weight: 600;
  width: 300px;
`;
const Button = styled.button`
  font-size: 18px;
  color: #fffdd5;
  font-weight: bold;
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
`;
export default WalletLogin;
