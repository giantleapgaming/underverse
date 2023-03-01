import { getComponentValue } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { walletAddress } from "../../utils/walletAddress";
import { NFTImage } from "../utils/NftImage";
import { UserAction } from "./userAction";

export const UserDetails = ({ layers }: { layers: Layers }) => {
  const [copy, setCopy] = useState(false);
  const {
    network: {
      components: { OwnedBy, Name, NFTID },
      world,
    },
    phaser: {
      localIds: { stationDetailsEntityIndex },
      components: { ShowStationDetails },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
    const factionIndex = world.entities.indexOf(ownedBy);
    const name = getComponentValue(Name, factionIndex)?.value;
    const NFTid = getComponentValue(NFTID, factionIndex)?.value;
    return (
      <S.Container>
        {NFTid && ownedBy && <NFTImage nftId={+NFTid} walletAddress={ownedBy} />}
        <p
          style={{ cursor: "pointer" }}
          onClick={() => {
            setCopy(true);
            navigator.clipboard.writeText(`${ownedBy}`);
            setTimeout(() => {
              setCopy(false);
            }, 1000);
          }}
        >
          {copy ? "Copy" : walletAddress(`${ownedBy}`)}
          <br />
          <span style={{ color: "white" }}>{name} </span>
        </p>
        <UserAction layers={layers} />
      </S.Container>
    );
  } else {
    return null;
  }
};

const S = {
  Container: styled.div`
    pointer-events: fill;
    margin: 5px;
  `,
  Flex: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: start;
    gap: 16px;
  `,
};
