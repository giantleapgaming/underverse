import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";
import { Layers } from "../../../../types";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { getNftId } from "../../../network/utils/getNftId";

export const Repair = ({
  level,
  repairSystem,
  defence,
  repairCost,
  layers,
}: {
  level: number;
  defence: number;
  repairSystem: () => void;
  repairCost: number;
  layers: Layers;
}) => {
  const {
    phaser: {
      localApi: { setTutorialCompleteModal },
    },
    network: {
      components: { NFTID, TutorialStep },
    },
  } = layers;

  return (
    <S.Details>
      {defence < level * 100 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <S.Cost>
              REPAIR COST
              <br />
              {convertPrice(repairCost / 2)}
            </S.Cost>
          </div>
          <S.InlinePointer
            onClick={async () => {
              repairSystem();
              const nftDetails = getNftId(layers);
              const nftEntity = [...getComponentEntities(NFTID)].find((nftId) => {
                const id = +getComponentValueStrict(NFTID, nftId).value;
                return nftDetails?.tokenId === id;
              });
              const number = getComponentValue(TutorialStep, nftEntity)?.value;
              if (number && (+number === 240 || +number === 250)) {
                setTutorialCompleteModal(true, "Cadet training completed!");
              }
            }}
          >
            <S.Img src="/button/whiteButton.png" />
            <S.DeployText>REPAIR</S.DeployText>
          </S.InlinePointer>
        </>
      ) : (
        <S.Cost style={{ marginTop: "15px" }}>MAX DEFENCE</S.Cost>
      )}
    </S.Details>
  );
};
const S = {
  Img: styled.img`
    margin: auto;
    width: 100%;
  `,
  Details: styled.div`
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    justify-content: space-around;
    margin-top: 20px;
  `,
  OtherDetails: styled.p`
    color: #ffffff;
    font-size: 12px;
  `,
  Cost: styled.p`
    color: #ffffff;
    font-weight: 700;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
    color: #ffffff;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
    color: #ffffff;
  `,
};
