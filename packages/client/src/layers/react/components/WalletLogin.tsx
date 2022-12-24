import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Wallet } from "ethers";

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
  const [newWalletCreation, setNewWalletCreation] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (playGame) {
            window.location.reload();
            return;
          }
        }}
      >
        <AnimatedGradientText>Welcome to Underverse</AnimatedGradientText>
        <div>
          {allKeys.length && (
            <div>
              <P>Existing Account</P>
              {allKeys.map((pk: string, index: number) => {
                const wallet = new Wallet(pk);
                const address = wallet.address;
                return (
                  <P key={pk}>
                    {index + 1}. {address}
                  </P>
                );
              })}
            </div>
          )}
          <P>
            i. import wallet private key
            <br />
            c. create new wallet
          </P>
        </div>
        <TerminalOutput>{output}</TerminalOutput>
        <div>
          {!privateKey.show && !playGame && (
            <Input
              ref={inputRef}
              value={input}
              onKeyDown={(e) => {
                let newOutPut = "";
                if (e.key === "Enter") {
                  switch (input) {
                    case "i": {
                      newOutPut = `${output} \n $ Enter the private key which as xDAI in it \n `;
                      setOutput(newOutPut);
                      setInput("");
                      setPrivetKey({ show: true, input: "" });
                      break;
                    }
                    case "c": {
                      console.log("c");
                      break;
                    }
                  }
                  if (typeof +input === "number") {
                    const getWalletIndex = +input;
                    const privateKey = allKeys[getWalletIndex - 1];
                    if (privateKey) {
                      const wallet = new Wallet(privateKey);
                      const address = wallet.address;
                      sessionStorage.setItem("user-burner-wallet", privateKey);
                      newOutPut = `${output} \n $ wallet address - ${address} \n \n $ Press Enter to play the game`;
                      setOutput(newOutPut);
                      setPlayGame(true);
                      setTimeout(() => {
                        buttonRef.current?.focus();
                      });
                    } else {
                      setError("Please Enter a valid Input");
                    }
                    return;
                  }
                  setError("Please Enter a valid input");
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
                let newOutPut = "";

                if (e.key === "Enter") {
                  try {
                    const wallet = new Wallet(privateKey.input);
                    const address = wallet.address;
                    sessionStorage.setItem("user-burner-wallet", privateKey.input);
                    newOutPut = `${output} \n $ wallet address - ${address} \n \n $ Press Enter to play the game`;
                    setOutput(newOutPut);
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
      </form>
    </Container>
  );
};
const Container = styled.div`
  height: 100vh;
  background: black;
  padding: 100px;
`;
const hue = keyframes`
 from {
   -webkit-filter: hue-rotate(0deg);
 }
 to {
   -webkit-filter: hue-rotate(-360deg);
 }
`;
const AnimatedGradientText = styled.h1`
  color: #33aadd;
  background-image: -webkit-linear-gradient(92deg, #fbd811, #0feb1a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-animation: ${hue} 10s infinite linear;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol";
  font-feature-settings: "kern";
  font-size: 30px;
  font-weight: 700;
  line-height: 48px;
  overflow-wrap: break-word;
  text-rendering: optimizelegibility;
  -moz-osx-font-smoothing: grayscale;
`;
const P = styled.p`
  color: wheat;
  margin-top: 10px;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 20px;
`;
const Error = styled.p`
  color: #ef0909;
  margin-top: 10px;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 20px;
`;
const TerminalOutput = styled.div`
  color: wheat;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 20px;
  white-space: pre-line;
`;
const Input = styled.input`
  margin-top: 30px;
  font-size: 30;
  border: none;
  outline: none;
  margin: 0;
  background-color: 0;
  color: wheat;
  font-weight: 800;
  width: 100%;
`;
const Button = styled.button`
  background: rgba(149, 200, 30, 0.4);
  font-size: 30px;
  color: wheat;
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 800;
  margin-top: 10px;
  box-shadow: rgba(149, 200, 30, 0.4) 5px 5px, rgba(185, 196, 29, 0.3) 10px 10px, rgba(95, 133, 42, 0.2) 15px 15px;
`;
export default WalletLogin;
