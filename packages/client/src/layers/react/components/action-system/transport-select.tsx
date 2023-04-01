import { useState } from "react";
import styled from "styled-components";
import { Cash } from "./cash";
import { Ship } from "./ship";
import { Transport } from "./transport";

export const TransportSelect = ({
  space,
  playSound,
  transport,
  distance,
  faction,
  cash,
  onCashTransport,
  transferOwnerShip,
  destinationStationOwnerName,
  isDestinationSelectedOwner,
}: {
  space: number;
  playSound: () => void;
  transport: (amount: number) => void;
  onCashTransport: (amount: number) => void;
  transferOwnerShip: () => void;
  distance: number;
  faction: number;
  cash: number;
  destinationStationOwnerName: string;
  isDestinationSelectedOwner?: boolean;
}) => {
  const [selected, setSelected] = useState<"mine" | "cash" | "ship" | undefined>(
    isDestinationSelectedOwner ? "mine" : undefined
  );

  return (
    <>
      {!selected && (
        <S.Container>
          {/* <S.Button
            onClick={() => {
              setSelected("ship");
              playSound();
            }}
          >
            <S.Title>SHIP</S.Title>
            <S.Img src="/layout/hex.png" width="50px" height="44px" />
            <S.Img src={`/build-stations/harvester.png`} width="30px" height="30px" />
          </S.Button>
          <S.Button
            onClick={() => {
              setSelected("cash");
              playSound();
            }}
          >
            <S.Title>CASH</S.Title>
            <S.Img src="/layout/hex.png" width="50px" height="44px" />
            <S.Img src={`/build-stations/cash.png`} width="20px" height="30px" />
          </S.Button> */}
          <S.Button
            onClick={() => {
              setSelected("mine");
              playSound();
            }}
          >
            <S.Title>MINERALS</S.Title>
            <S.Img src="/layout/hex.png" width="50px" height="44px" />
            <S.Img src={`/build-stations/crystal.png`} width="30px" height="30px" />
          </S.Button>
        </S.Container>
      )}
      {selected === "ship" && <Ship name={destinationStationOwnerName} transfer={transferOwnerShip} />}
      {selected === "cash" && <Cash space={cash} playSound={playSound} sendCash={onCashTransport} />}
      {selected === "mine" && (
        <Transport space={space} playSound={playSound} transport={transport} distance={distance} faction={faction} />
      )}
    </>
  );
};

const S = {
  Flex: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: start;
    gap: 16px;
    height: 100%;
    width: 90%;
    justify-content: space-around;
    padding-bottom: 30px;
  `,
  Container: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: start;
    gap: 16px;
    margin-top: 5px;
  `,
  Button: styled.div`
    cursor: pointer;
    position: relative;
    width: 54px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 50px;
  `,
  Title: styled.p`
    margin-top: -70px;
    text-align: center;
    font-size: 12px;
  `,
  BalanceText: styled.p`
    font-size: 10px;
  `,
  Img: styled.img`
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    margin: auto;
  `,
  ImgCrystal: styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    position: absolute;
    bottom: -40px;
    left: -10px;
  `,
  Text: styled.div`
    align-items: center;
    font-size: 12px;
  `,
};
