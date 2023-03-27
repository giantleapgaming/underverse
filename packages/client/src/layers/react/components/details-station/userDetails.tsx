import { getComponentValue } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { getNftId } from "../../../network/utils/getNftId";
import { walletAddress } from "../../utils/walletAddress";
import { NFTImg } from "../NFTImg";
import { UserAction } from "./userAction";

export const UserDetails = ({ layers }: { layers: Layers }) => {
  const [copy, setCopy] = useState(false);
  const {
    network: {
      components: { Name, NFTID },
      world,
      network: { connectedAddress },
    },
  } = layers;

  const address = connectedAddress.get();
  const factionIndex = world.entities.indexOf(address);
  const name = getComponentValue(Name, factionIndex)?.value;
  const nftDetails = getNftId(layers);
  const nftId = getComponentValue(NFTID, factionIndex)?.value;
  return (
    <S.Container>
      {nftDetails ? (
        <img src={nftDetails.imageUrl} width={64} height={64} />
      ) : (
        <>{nftId && <NFTImg size={64} id={+nftId} />}</>
      )}
      <p
        style={{ cursor: "pointer" }}
        onClick={() => {
          setCopy(true);
          navigator.clipboard.writeText(`${address}`);
          setTimeout(() => {
            setCopy(false);
          }, 1000);
        }}
      >
        {copy ? "Copy" : walletAddress(`${address}`)}
        <br />
        <span style={{ color: "white" }}>{name} </span>
      </p>
      <UserAction layers={layers} />
    </S.Container>
  );
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
