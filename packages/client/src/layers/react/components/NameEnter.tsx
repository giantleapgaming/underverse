import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { useState } from "react";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { Nft } from "./Nft";
import { computedToStream } from "@latticexyz/utils";
import { toast } from "sonner";
import { keyframes } from "styled-components";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";

const NameEnter = ({ layers }: { layers: Layers }) => {
  const [name, setName] = useState("");
  const [reactNftId, setReactNftId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  const {
    network: {
      api: { initSystem },
      network: { connectedAddress },
      components: { Name, NFTID },
    },
    phaser: { sounds, setValue },
  } = layers;
  return (
    <>
      <Container>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name) {
              return;
            }
            sounds["click"].play();
            if (alreadyLoggedIn && typeof reactNftId === "number") {
              setValue.SelectedNftID(reactNftId);
              return;
            } else if (reactNftId) {
              setValue.SelectedNftID(reactNftId);
              toast.promise(
                async () => {
                  try {
                    setLoading(true);
                    const tx = await initSystem(name, reactNftId);
                    await tx.wait();
                  } catch (e: any) {
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
        >
          <div>
            <Nft
              setSelectNft={(selectNft) => {
                if (typeof selectNft?.tokenId === "number") {
                  const allNameEntities = [...getComponentEntities(Name)];
                  allNameEntities.find((entity) => {
                    const name = getComponentValueStrict(Name, entity)?.value;
                    const nftId = getComponentValueStrict(NFTID, entity).value;
                    if (+nftId === selectNft?.tokenId) {
                      setAlreadyLoggedIn(true);
                      setName(name);
                    }
                  });
                  setReactNftId(selectNft?.tokenId);
                } else {
                  setReactNftId(undefined);
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
                  <img src="/button/enterNameBtn.png" />
                </Button>
              </S.Inline>
            )}
          </div>
        </Form>
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
  overflow-y: auto;
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
          scenes: {
            Main: { input },
          },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const doesNftExist = checkLoggedIn(layers);
          if (doesNftExist) {
            input.enableInput();
            return;
          } else {
            input.disableInput();
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
