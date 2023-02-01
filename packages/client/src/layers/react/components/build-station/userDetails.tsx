import { getComponentValue } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { walletAddress } from "../../utils/walletAddress";
import { UserAction } from "./userAction";

export const UserDetails = ({ layers }: { layers: Layers }) => {
  const [copy, setCopy] = useState(false);
  const {
    network: {
      components: { Faction },
      world,
      network: { connectedAddress },
    },
  } = layers;
  const address = connectedAddress.get();
  const factionIndex = world.entities.indexOf(address);
  const faction = getComponentValue(Faction, factionIndex)?.value;
  return (
    <S.Container>
      <img src={`/ui/${faction && +faction}-1.png`} />
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
