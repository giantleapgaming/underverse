export const getNftData = async (
  walletAddress?: string
): Promise<
  {
    tokenId: number;
    imageUrl: string;
  }[]
> => {
  const params = new URLSearchParams(window.location.search);
  const chainIdString = params.get("chainId");
  try {
    const response = await fetch("https://api.giantleap.gg/api/l1-nfts", {
      method: "POST",
      body: JSON.stringify({
        address: walletAddress,
        nftContract: "0xd06E3Df5753baB6047Ef2d8cb0381D99dDF999Bb",
        chainId: chainIdString,
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
