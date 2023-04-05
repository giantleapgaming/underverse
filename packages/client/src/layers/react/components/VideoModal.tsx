import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import styled from "styled-components";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { getNftId } from "../../network/utils/getNftId";
import { TutorialDataListPart1, TutorialDataListPart2 } from "./TutorialsList";
import { tutorialHighlightOrderCompleted } from "./utils/tutorialHighlightOrder";

const VideoModal = ({ layers, videoId }: { layers: Layers; videoId: string }) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
      localApi: { setTutorial },
    },
  } = layers;

  return (
    <S.Container
      onMouseEnter={() => {
        input.disableInput();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setTutorial(false);
        input.enableInput();
      }}
      onClick={() => {
        setTutorial(false);
        input.enableInput();
      }}
      onMouseLeave={() => {
        input.enableInput();
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", gap: "8px" }}>
        <iframe
          onClick={(e) => {
            e.stopPropagation();
          }}
          width="853"
          height="480"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded youtube"
        />
        <S.Button
          type="button"
          onClick={() => {
            setTutorial(false);
            input.enableInput();
          }}
        >
          X
        </S.Button>
      </div>
    </S.Container>
  );
};

const S = {
  Container: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    pointer-events: fill;
    background-color: #00000058;
    z-index: 49;
    position: relative;
  `,

  Button: styled.button`
    outline: none;
    border: none;
    background: transparent;
    cursor: pointer;
    color: white;
    font-size: 34px;
    margin-top: -12px;
  `,
};

export const registerModalScreen = () => {
  registerUIComponent(
    "registerModalScreen",
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
          components: { TutorialModalDetails },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, TutorialModalDetails.update$).pipe(
        map(() => {
          const nftDetails = getNftId(layers);
          const id = [...getComponentEntities(NFTID)].find((nftId) => {
            const id = +getComponentValueStrict(NFTID, nftId).value;
            return nftDetails?.tokenId === id;
          });
          const videoDetails = getComponentValue(TutorialModalDetails, modalIndex);
          const selectedId = videoDetails?.tutorialNumber;
          if (id && videoDetails?.showModal && typeof selectedId == "number") {
            const videoDetails = TutorialDataListPart1.find(({ id }) => id === selectedId);
            const videoDetails2 = TutorialDataListPart2.find(({ id }) => id === selectedId);

            if (videoDetails) return { layers, videoId: videoDetails?.videoId };
            if (videoDetails2) return { layers, videoId: videoDetails2?.videoId };
          }
          return;
        })
      );
    },
    ({ layers, videoId }) => {
      return <VideoModal layers={layers} videoId={videoId} />;
    }
  );
};