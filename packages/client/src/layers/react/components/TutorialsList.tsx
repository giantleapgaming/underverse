import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { getNftId } from "../../network/utils/getNftId";
import styled, { keyframes } from "styled-components";
import { RefObject, useEffect, useRef } from "react";

const TutorialsList = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
      localApi: { setTutorial },
    },
    network: {
      components: { NFTID, TutorialStep },
    },
  } = layers;
  const nftDetails = getNftId(layers);
  const nftEntity = [...getComponentEntities(NFTID)].find((nftId) => {
    const id = +getComponentValueStrict(NFTID, nftId).value;
    return nftDetails?.tokenId === id;
  });
  const number = +getComponentValueStrict(TutorialStep, nftEntity).value;
  const list = typeof number == "number" && +number < 135 ? TutorialDataListPart1 : TutorialDataListPart2;
  const listRef: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    if (listRef.current !== null) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [list]);
  return (
    <S.Container ref={listRef}>
      <S.ListContainer
        onMouseEnter={() => {
          input.disableInput();
        }}
        onMouseLeave={() => {
          input.enableInput();
        }}
      >
        <S.Title>
          <Circle>
            <I>i</I>
          </Circle>
          <p style={{ fontSize: "18px", color: "#00fde4", fontWeight: "600", letterSpacing: "1.2", lineHeight: "1.5" }}>
            TUTORIAL <br /> MISSIONS
          </p>
        </S.Title>
        <S.Hr></S.Hr>
        <S.UL>
          <ul>
            {list.map((item, index) => {
              const show = typeof number === "number" ? (+number >= item.showId ? true : false) : false;
              const completed = typeof number === "number" ? (+number >= item.id ? true : false) : false;
              const checked = typeof number === "number" ? (+number >= item.id ? true : false) : false;
              return (
                <li key={index} style={{ display: show ? "block" : "none" }}>
                  <S.ListItem
                    onClick={() => {
                      setTutorial(true, item.id);
                    }}
                  >
                    <div style={{ display: "flex", gap: "7px", alignItems: "center", justifyContent: "center" }}>
                      <S.Index checked={completed}>{index + 1}</S.Index>
                      <S.Label checked={completed}>{item.label}</S.Label>
                    </div>
                    <S.CheckBox type="checkbox" checked={checked} />
                    {!checked ? <ArrowLeft /> : <div style={{ width: "20px" }}></div>}
                  </S.ListItem>
                </li>
              );
            })}
          </ul>
        </S.UL>
      </S.ListContainer>
    </S.Container>
  );
};

const S = {
  Container: styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    padding-left: 10px;
    font-family: monospace;
    gap: 150px;
  `,
  ListContainer: styled.div`
    display: flex;
    pointer-events: fill;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  `,

  UL: styled.ul`
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
  `,
  Title: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  `,
  Hr: styled.div`
    width: 165px;
    border: 2.8px solid #00fde4;
    height: 100%;
    color: #00fde4;
    margin-top: 10px;
    margin-bottom: 10px;
  `,
  ListItem: styled.label`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 22px;
    margin-bottom: 8px;
    cursor: pointer;
  `,
  Index: styled.span<{ checked?: boolean }>`
    border-radius: 0.2em;
    border: 0.22em solid ${({ checked }) => (checked ? "#A6A6A6" : "#00fde4")};
    padding: 0px 0px;
    font-size: 15px;
    width: 25px;
    text-align: center;
    color: ${({ checked }) => (checked ? "#A6A6A6" : "#00fde4")};
    font-family: "MyOTFFontBold";
  `,

  Label: styled.span<{ checked?: boolean }>`
    font-size: 10px;
    color: ${({ checked }) => (checked ? "#A6A6A6" : "#00fde4")};
    font-weight: bold;
    width: 80px;
    text-transform: uppercase;
    font-family: "MyOTFFont";
  `,

  CheckBox: styled.input`
    -webkit-appearance: none;
    appearance: none;
    width: 2em;
    height: 2.2em;
    border-radius: 0.2em;
    border: 0.2em solid #00fde4;
    outline: none;
    cursor: pointer;
    :checked {
      background-image: url("/ui/check.png");
      background-repeat: no-repeat;
      background-position: center center;
      background-size: contain;
    }
  `,
  Modal: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  CloseModalButton: styled.button`
    outline: none;
    border: none;
    background: transparent;
    cursor: pointer;
    color: white;
  `,
  ModalContainer: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 8px;
    margin-top: -20px;
  `,
};

export const registerTutorialsListScreen = () => {
  registerUIComponent(
    "TutorialsListScreen",
    {
      colStart: 1,
      colEnd: 4,
      rowStart: 4,
      rowEnd: 12,
    },
    (layers) => {
      const {
        network: {
          components: { NFTID, TutorialStep },
          network: { connectedAddress },
        },
        phaser: {
          components: { SelectedNftID },
          localIds: { nftId },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, TutorialStep.update$, SelectedNftID.update$).pipe(
        map(() => {
          const selectedNftId = getComponentValue(SelectedNftID, nftId)?.selectedNftID;
          const allNftsEntityIds = [...getComponentEntities(NFTID)];
          const doesNftExist = allNftsEntityIds.some((entityId) => {
            const selectedNft = getComponentValueStrict(NFTID, entityId).value;
            return +selectedNft === selectedNftId;
          });
          if (doesNftExist) {
            return { layers };
          } else {
            return;
          }
        })
      );
    },
    ({ layers }) => {
      return <TutorialsList layers={layers} />;
    }
  );
};

export interface TutorialDataItem<TLabel extends string> {
  id: number;
  showId: number;
  label: TLabel;
  videoId: string;
}

export const TutorialDataListPart1: TutorialDataItem<string>[] = [
  { id: 10, showId: 0, label: "Deploy", videoId: "TeHWAuYVnDE" },
  { id: 20, showId: 10, label: "Move", videoId: "YJGZtZ-dZOY" },
  { id: 30, showId: 20, label: "Signals", videoId: "7qk1QHyEq3I" },
  { id: 40, showId: 30, label: "Prospect", videoId: "Sx2SmhBzQwg" },
  { id: 50, showId: 40, label: "Mine", videoId: "rTToSkjFkPQ" },
  { id: 60, showId: 50, label: "Refuel", videoId: "dSrmylM4U0E" },
  { id: 70, showId: 60, label: "Build Shipyard", videoId: "mcTJCeuGBFI" },
  { id: 80, showId: 70, label: "Transport", videoId: "CIa--7MQIjk" },
  { id: 90, showId: 80, label: "Build Ship", videoId: "uI0RF8MMOq4" },
  { id: 100, showId: 90, label: "Rapture Zone", videoId: "YonQUyWTqO8" },
  { id: 110, showId: 100, label: "Rapture", videoId: "NBqeNdbMuhw" },
  { id: 120, showId: 110, label: "Build Hab", videoId: "UE0qHdwJ2wY" },
  { id: 130, showId: 120, label: "Transport PPL", videoId: "_DPn9KG0bsw" },
  { id: 135, showId: 130, label: "Mint NFT", videoId: "" },
];

export const objectListTutorialDataListPart1 = TutorialDataListPart1.reduce((acc, curr) => {
  acc[curr.label] = curr.showId;
  return acc;
}, {} as { [key: string]: number });

export const TutorialDataListPart2: TutorialDataItem<string>[] = [
  { id: 140, showId: 135, label: "Upgrade", videoId: "6_kTXYGLR3U" },
  { id: 150, showId: 140, label: "Depots", videoId: "ZQGChE8dQks" },
  { id: 160, showId: 150, label: "Sell Minerals", videoId: "7gwIHkbk7H8" },
  { id: 170, showId: 160, label: "Attack Ships", videoId: "Q0dp81Ft4rU" },
  { id: 180, showId: 170, label: "Attacking", videoId: "2JIGd8dUlxk" },
  { id: 190, showId: 180, label: "Fuel Carriers", videoId: "oetIqCRwvJM" },
  { id: 200, showId: 190, label: "Refuel", videoId: "46j1buZaH84" },
  { id: 210, showId: 200, label: "Build Walls", videoId: "PINPjIgXLYo" },
  { id: 240, showId: 210, label: "Scrapping", videoId: "XutRD4yRf_4" },
  { id: 250, showId: 240, label: "Repairs", videoId: "1KWHLS5XSG0" },
];
export const objectListTutorialDataListPart2 = TutorialDataListPart2.reduce((acc, curr) => {
  acc[curr.label] = curr.showId;
  return acc;
}, {} as { [key: string]: number });
const pulsate = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.2);
  }
`;

const neon = keyframes`
  from {
    text-shadow:
      0 0 3px #fff,
      0 0 10px #fff,
      0 0 20px #fff,
      0 0 30px #00fde4,
      0 0 40px #00fde4,
      0 0 70px #00fde4,
      0 0 80px #00fde4;
  }
  to {
    text-shadow:
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px #fff,
      0 0 30px #00fde4,
      0 0 40px #00fde4,
      0 0 70px #00fde4,
      0 0 80px #00fde4;
  }
`;
const Circle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  border: 4px solid #00fde4;
  animation: ${neon} 1s ease-in-out infinite alternate, ${pulsate} 1s ease-in-out infinite alternate;
  margin-left: 1em;
`;
const flash = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const I = styled.i`
  font-size: 1em;
  color: #00fde4;
  animation: ${flash} 1s ease-in-out infinite;
`;

const moveLeft = keyframes`
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(0);
  }
`;

const ArrowLeft = styled.span`
  display: inline-block;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-right: 20px solid #00fde4;
  border-bottom: 10px solid transparent;
  animation: ${moveLeft} 1s infinite;
`;
