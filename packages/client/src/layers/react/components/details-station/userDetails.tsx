import { getComponentValue } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { getNftId, isOwnedBy } from "../../../network/utils/getNftId";
import { walletAddress } from "../../utils/walletAddress";
import { NFTImg } from "../NFTImg";
import { UserAction } from "./userAction";

export const UserDetails = ({ layers }: { layers: Layers }) => {
  const [copy, setCopy] = useState(false);
  const {
    network: {
      components: { OwnedBy, Name, NFTID },
      world,
      network: { connectedAddress },
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
    const nftId = getComponentValue(NFTID, factionIndex)?.value;
    const nftDetails = getNftId(layers);
    const isOwner = isOwnedBy(layers);
    return (
      <S.Container>
        {nftDetails && isOwner ? (
          <img src={nftDetails.imageUrl} width={64} height={64} />
        ) : (
          <>{nftId && <NFTImg size={64} id={+nftId} />}</>
        )}
        <p
          style={{ cursor: "pointer" }}
          onClick={() => {
            setCopy(true);
            navigator.clipboard.writeText(`${connectedAddress.get()}`);
            setTimeout(() => {
              setCopy(false);
            }, 1000);
          }}
        >
          {isOwner && (
            <>
              {copy ? "Copy" : walletAddress(`${connectedAddress.get()}`)}
              <br />
            </>
          )}
          <span style={{ color: "white" }}>{name}</span>
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
