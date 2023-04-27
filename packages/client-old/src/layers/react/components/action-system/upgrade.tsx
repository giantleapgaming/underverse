import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";
import { factionData } from "../../../../utils/constants";
import { Layers } from "../../../../types";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { getNftId } from "../../../network/utils/getNftId";
import { toast } from "sonner";

export const Upgrade = ({
  level,
  upgradeSystem,
  defence,
  faction,
  layers,
}: {
  level: number;
  defence: number;
  upgradeSystem: () => void;
  faction: number;
  layers: Layers;
}) => {
  const nftDetails = getNftId(layers);
  const {
    network: {
      components: { Cash, NFTID },
    },
  } = layers;
  const ownedByIndex = [...getComponentEntities(NFTID)].find((nftId) => {
    const nftIdValue = getComponentValueStrict(NFTID, nftId)?.value;
    return nftIdValue && +nftIdValue === nftDetails?.tokenId;
  });

  const cash = getComponentValue(Cash, ownedByIndex)?.value;

  const upgradeCost = Math.pow(level + 1, 2) * 1_000 * factionData[+faction]?.upgrade;
  return (
    <S.Details>
      {level < 8 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <S.Cost>{level && convertPrice(upgradeCost)}</S.Cost>
            <S.OtherDetails>
              LEVEL: <span style={{ color: "white" }}>{level}</span> &rarr; {level + 1}
            </S.OtherDetails>
            <S.OtherDetails>
              STORAGE: <span style={{ color: "white" }}>{level}</span> &rarr; {level + 1}
            </S.OtherDetails>
            <S.OtherDetails>
              DEFENCE: <span style={{ color: "white" }}>{defence}</span> &rarr; {defence + 100}
            </S.OtherDetails>
          </div>
          <S.InlinePointer
            onClick={() => {
              if (cash && Math.floor(+cash / 10_00_000) >= upgradeCost) {
                upgradeSystem();
              } else {
                toast.error("No enough cash to upgrade");
              }
            }}
          >
            <S.Img src="/button/orangeButton.png" />
            <S.DeployText>UPGRADE</S.DeployText>
          </S.InlinePointer>
        </>
      ) : (
        <S.Cost style={{ marginTop: "20px" }}>MAX LEVEL REACHED</S.Cost>
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
    margin-top: 5px;
  `,
  OtherDetails: styled.p`
    color: #fb934e;
    font-size: 12px;
  `,
  Cost: styled.p`
    color: #fb934e;
    font-weight: 700;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
    color: #fb934e;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
    color: "#fb934e";
  `,
};
