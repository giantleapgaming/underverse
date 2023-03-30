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
    const response = await fetch("https://api.giantleap.gg/api/user-nfts", {
      method: "POST",
      body: JSON.stringify({
        address: walletAddress,
        nftContract: "0x5bAB1484F457Df67741E4C0e5ed06AFaDC31e94F",
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
