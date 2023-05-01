export const getNftData = async (
  walletAddress?: string,
  nftContract?: string
): Promise<
  {
    tokenId: number;
    imageUrl: string;
  }[]
> => {
  const params = new URLSearchParams(window.location.search);
  const chainIdString = params.get("chainId");
  try {
    const response = await fetch("https://api.giantleap.gg/api/user-nfts", {
      method: "POST",
      body: JSON.stringify({
        address: walletAddress,
        nftContract: nftContract || "0xfA4F088838A53Cdcc6A9E233Ff60B86c1AFFb07d",
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
