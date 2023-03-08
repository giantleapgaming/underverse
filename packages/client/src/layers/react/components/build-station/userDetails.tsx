import { getComponentValue } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { getNftId } from "../../../network/utils/getNftId";
import { walletAddress } from "../../utils/walletAddress";
import { UserAction } from "./userAction";

export const UserDetails = ({ layers }: { layers: Layers }) => {
  const [copy, setCopy] = useState(false);
  const {
    network: {
      components: { Name },
      world,
      network: { connectedAddress },
    },
  } = layers;

  const address = connectedAddress.get();
  const factionIndex = world.entities.indexOf(address);
  const name = getComponentValue(Name, factionIndex)?.value;
  const nftDetails = getNftId(layers);
  return (
    <S.Container>
      {nftDetails && <img src={nftDetails.imageUrl} width={64} height={64} />}
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
