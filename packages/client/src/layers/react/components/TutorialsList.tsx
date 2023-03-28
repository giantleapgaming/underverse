import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import styled from "styled-components";
import { ChangeEvent, useState } from "react";

const TutorialsList = ({ layers }: { layers: Layers }) => {
  const [checkedItems, setCheckedItems] = useState([
    { id: 1, label: "DEPLOY", isChecked: false, videoId: "VIDEO_ID_1" },
    { id: 2, label: "MOVE", isChecked: false, videoId: "VIDEO_ID_2" },
    { id: 3, label: "SIGNALS", isChecked: false, videoId: "VIDEO_ID_3" },
    { id: 4, label: "PROSPECT", isChecked: false, videoId: "VIDEO_ID_3" },
    { id: 5, label: "MINE", isChecked: false, videoId: "VIDEO_ID_3" },
    { id: 6, label: "REFUEL", isChecked: false, videoId: "VIDEO_ID_3" },
    { id: 7, label: "BUILD SHIPYARD", isChecked: false, videoId: "VIDEO_ID_3" },
    { id: 8, label: "TRANSPORT", isChecked: false, videoId: "VIDEO_ID_3" },
    { id: 9, label: "BUILD SHIP", isChecked: false, videoId: "VIDEO_ID_3" },
    { id: 10, label: "RAPTURE", isChecked: false, videoId: "VIDEO_ID_3" },
    { id: 11, label: "BUILD HUB", isChecked: false, videoId: "VIDEO_ID_3" },
    { id: 12, label: "TRANSPORT PPL", isChecked: false, videoId: "VIDEO_ID_3" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [videoId, setVideoId] = useState("");

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index].isChecked = event.target.checked;
    setCheckedItems(newCheckedItems);
    if (event.target.checked) {
      console.log(`Item ${index + 1} is selected.`);
      setVideoId(checkedItems[index].videoId);
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  };

  return (
    <S.Container>
      <S.ListContainer>
        <S.Title>
          <img src="/img/detailsIcon.png" style={{ marginLeft: "10px" }} />
          <p style={{ fontSize: "16px", color: "#00fde4", fontWeight: "600", letterSpacing: "1" }}>
            TUTORIAL <br /> MISSIONS
          </p>
        </S.Title>
        <S.Hr></S.Hr>
        <div>
          <ul>
            {checkedItems.map((item, index) => (
              <li key={index} style={{ display: index === 0 || checkedItems[index - 1].isChecked ? "block" : "none" }}>
                <S.ListItem>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                    <S.Index checked={item.isChecked}>{index + 1}</S.Index>
                    <S.Label checked={item.isChecked}>{item.label}</S.Label>
                  </div>
                  <S.CheckBox
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={(event) => handleCheckboxChange(event, index)}
                  />
                </S.ListItem>
              </li>
            ))}
          </ul>
        </div>
      </S.ListContainer>
      {showModal && (
        <S.ModalContainer>
          <S.Modal>
            <iframe
              title="YouTube video"
              width="460"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </S.Modal>
          <S.CloseModalButton onClick={() => setShowModal(false)}>X</S.CloseModalButton>
        </S.ModalContainer>
      )}
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
    gap: 60px;
  `,
  ListContainer: styled.div`
    display: flex;
    pointer-events: fill;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  `,
  Title: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  `,
  Hr: styled.hr`
    width: 180px;
    color: #00fde4;
    margin-top: 10px;
    margin-bottom: 10px;
  `,
  ListItem: styled.label`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 180px;
    gap: 40px;
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
    gap: 4px;
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
