import styled from "styled-components";

export const Ship = ({ transfer, name }: { transfer: () => void; name: string }) => {
  return (
    <>
      <S.Row style={{ justifyContent: "space-around", width: "100%", paddingTop: "5%" }}>
        <S.Text>
          ARE YOU SURE YOU WANT TO TRANSFER OWNERSHIP TO{" "}
          <span style={{ color: "#008073", fontWeight: "bold" }}>{name.toUpperCase()}?</span>
        </S.Text>
        <S.InlinePointer onClick={transfer}>
          <S.ButtonImg src="/button/greenButton.png" />
          <S.DeployText>CONFIRM</S.DeployText>
        </S.InlinePointer>
      </S.Row>
    </>
  );
};

const S = {
  Text: styled.p`
    font-size: 13px;
    font-weight: 500;
    color: #ffffff;
    text-align: center;
    max-width: 150px;
  `,
  Column: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  `,
  Img: styled.img`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
  `,
  ButtonImg: styled.img`
    margin: auto;
    width: 100%;
  `,
};
