import { getComponentValue } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { getNftId } from "../../../network/utils/getNftId";
import { walletAddress } from "../../utils/walletAddress";
import { NFTImg } from "../NFTImg";
import { ShowAttributeModal } from "../../../local/components";

export const UserDetails = ({ layers }: { layers: Layers }) => {
  const [copy, setCopy] = useState(false);
  const {
    network: {
      components: { Name, NFTID },
      world,
      network: { connectedAddress },
    },
    phaser: {
      localApi: { setShowAttributeModal },
    },
  } = layers;

  const address = connectedAddress.get();
  const factionIndex = world.entities.indexOf(address);
  const name = getComponentValue(Name, factionIndex)?.value;
  const nftDetails = getNftId(layers);
  const nftId = getComponentValue(NFTID, factionIndex)?.value;
  console.log(nftDetails);
  return (
    <S.Container>
      {nftDetails ? (
        <div
          style={{ position: "relative", width: "64px", height: "64px", overflow: "hidden" }}
          onClick={() => {
            setShowAttributeModal(true);
          }}
        >
          <img src={nftDetails.imageUrl} width={64} height={64} />
          <div
            style={{
              content: "",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              boxShadow: "5px 5px 60px rgb(255, 250, 250)",
              borderRadius: "70%",
            }}
          ></div>
        </div>
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
