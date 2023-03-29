import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import styled from "styled-components";

const TutorialsList = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
    },
  } = layers;

  return (
    <S.Container
      onMouseEnter={() => {
        input.disableInput();
      }}
      onMouseLeave={() => {
        input.enableInput();
      }}
    >
      <S.ListContainer>
        <S.Title>
          <img src="/img/detailsIcon.png" style={{ marginLeft: "18px" }} />
          <p style={{ fontSize: "16px", color: "#00fde4", fontWeight: "600", letterSpacing: "1" }}>
            TUTORIAL <br /> MISSIONS
          </p>
        </S.Title>
        <S.Hr></S.Hr>
        <div>
          <ul>
            {TutorialDataList.map((item, index) => (
              <li key={index} style={{ display: index === 0 ? "block" : "none" }}>
                <S.ListItem>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                    <S.Index checked={item.isChecked}>{index + 1}</S.Index>
                    <S.Label checked={item.isChecked}>{item.label}</S.Label>
                  </div>
                  <S.CheckBox type="checkbox" checked={item.isChecked} />
                </S.ListItem>
              </li>
            ))}
          </ul>
        </div>
      </S.ListContainer>
    </S.Container>
  );
};

const S = {
  Container: styled.div`
    display: flex;
    pointer-events: fill;
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
    height: 360px;
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
    gap: 30px;
  `,
  Hr: styled.hr`
    width: 190px;
    color: #00fde4;
    margin-top: 10px;
    margin-bottom: 10px;
  `,
  ListItem: styled.label`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    margin-bottom: 8px;
  `,
  Index: styled.span<{ checked?: boolean }>`
    border-radius: 0.2em;
    border: 0.25em solid ${({ checked }) => (checked ? "#A6A6A6" : "#00fde4")};
    padding: 0px 6px;
    font-size: 15px;
    color: ${({ checked }) => (checked ? "#A6A6A6" : "#00fde4")};
  `,

  Label: styled.span<{ checked?: boolean }>`
    font-size: 10px;
    color: ${({ checked }) => (checked ? "#A6A6A6" : "#00fde4")};
    font-weight: bold;
    width: 120px;
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
      colEnd: 10,
      rowStart: 4,
      rowEnd: 10,
    },
    (layers) => {
      const {
        network: {
          components: { NFTID },
          network: { connectedAddress },
        },
        phaser: {
          components: { SelectedNftID },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$).pipe(
        map(() => {
          return { layers };
        })
      );
    },
    ({ layers }) => {
      return <TutorialsList layers={layers} />;
    }
  );
};

export const TutorialDataList = [
  { id: 1, label: "Build Harvester", isChecked: false, videoId: "VIDEO_ID_1" },
  { id: 2, label: "Move", isChecked: false, videoId: "VIDEO_ID_2" },
  { id: 3, label: "Encounter something", isChecked: false, videoId: "VIDEO_ID_3" },
  { id: 4, label: "Prospect", isChecked: false, videoId: "VIDEO_ID_4" },
  { id: 5, label: "Harvest", isChecked: false, videoId: "VIDEO_ID_5" },
  { id: 6, label: "Refuel", isChecked: false, videoId: "VIDEO_ID_6" },
  { id: 7, label: "Build Shipyard", isChecked: false, videoId: "VIDEO_ID_7" },
  {
    id: 8,
    label: "Check that minerals were transferred from harvester to shipyard",
    isChecked: false,
    videoId: "VIDEO_ID_8",
  },
  { id: 9, label: "Build of ppl carrier", isChecked: false, videoId: "VIDEO_ID_9" },
  { id: 10, label: "Check if ppl carier was moved into spawning zone", isChecked: false, videoId: "VIDEO_ID_10" },
  { id: 11, label: "Move ppl from earth to ppl carrier", isChecked: false, videoId: "VIDEO_ID_11" },
  { id: 12, label: "Track build of hab", isChecked: false, videoId: "VIDEO_ID_12" },
  { id: 13, label: "Move ppl from ppl carrier to hab", isChecked: false, videoId: "VIDEO_ID_13" },
  { id: 14, label: "Upgrade", isChecked: false, videoId: "VIDEO_ID_14" },
  { id: 15, label: "Build Depot", isChecked: false, videoId: "VIDEO_ID_15" },
  { id: 16, label: "Transport minerals and sell", isChecked: false, videoId: "VIDEO_ID_16" },
  { id: 17, label: "Build Attack Ship", isChecked: false, videoId: "VIDEO_ID_17" },
  { id: 18, label: "Attack", isChecked: false, videoId: "VIDEO_ID_18" },
  { id: 19, label: "Build fuel carrier", isChecked: false, videoId: "VIDEO_ID_19" },
  { id: 20, label: "Move and Refuel from Fuel Carrier", isChecked: false, videoId: "VIDEO_ID_20" },
];
