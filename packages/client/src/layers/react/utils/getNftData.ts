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
        nftContract: "0x382FdcB10d799E028a6337E12B0C9DE49F70504B",
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
