export const getNftData = async (
  walletAddress?: string,
  nftContract?: string
): Promise<
  {
    tokenId: number;
    imageUrl: string;
  }[]
> => {
  try {
    const response = await fetch("https://api.giantleap.gg/api/user-nfts", {
      method: "POST",
      body: JSON.stringify({
        address: walletAddress,
        nftContract: nftContract || "0xE47118d4cD1F3f9FEEd93813e202364BEA8629b3",
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
