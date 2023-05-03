export const getNftData = async (
  walletAddress?: string
): Promise<
  {
    tokenId: number;
    imageUrl: string;
  }[]
> => {
  try {
    const response = await fetch("https://api.giantleap.gg/api/l1-nfts", {
      method: "POST",
      body: JSON.stringify({
        address: walletAddress,
        nftContract: "0x113113aE1Bb7204453406c2228934737e5bBCc26",
        chainId: 344215,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.status) {
      return data.nftData.userWalletNftData;
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
};
