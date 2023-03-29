import { useEffect, useState } from "react";

export const useNFTData = (id: number, walletAddress: string): { nftURL: string | undefined } => {
  const [nftURL, setNftURL] = useState<string | undefined>(undefined);
  const params = new URLSearchParams(window.location.search);
  const chainIdString = params.get("chainId");

  useEffect(() => {
    if (id && walletAddress) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("https://api.giantleap.gg/api/user-nfts", {
        method: "POST",
        body: JSON.stringify({
          address: walletAddress,
          nftContract: "0x3e2D7736aB18aBABDc4C377F63d58B1421cDAc12",
          chainId: chainIdString,
          nftTokenId: id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status) {
        setNftURL(data.nftData);
      }
    } catch (e) {
      console.log(e);
    }
  };
  return { nftURL };
};
