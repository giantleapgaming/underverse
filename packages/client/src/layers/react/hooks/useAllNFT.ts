import { useEffect, useState } from "react";
interface Image {
  tokenId: number;
  imageUrl: string;
}
export const useNFTData = (walletAddress: string): { allNfts: Image[] } => {
  const [allNfts, setAllNfts] = useState<Image[]>([]);
  const params = new URLSearchParams(window.location.search);
  const chainIdString = params.get("chainId");

  useEffect(() => {
    if (walletAddress) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("https://api.giantleap.gg/api/user-nfts", {
        method: "POST",
        body: JSON.stringify({
          address: walletAddress,
          nftContract: "0x61dbb18038c96df35e5f42cea18858f127eb1a89",
          chainId: chainIdString,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status) {
        setAllNfts(data.nftData.userWalletNftData);
      }
    } catch (e) {
      console.log(e);
    }
  };
  return { allNfts };
};
