import { useEffect, useState } from "react";
interface Image {
  tokenId: number;
  imageUrl: string;
}
export const useNFTData = (walletAddress?: string): { allNfts?: Image[]; loading: boolean; error: string } => {
  const [allNfts, setAllNfts] = useState<Image[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = new URLSearchParams(window.location.search);
  const chainIdString = params.get("chainId");

  useEffect(() => {
    if (walletAddress) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.giantleap.gg/api/user-nfts", {
        method: "POST",
        body: JSON.stringify({
          address: walletAddress,
          nftContract: "0x3e2D7736aB18aBABDc4C377F63d58B1421cDAc12",
          chainId: chainIdString,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status) {
        setAllNfts(data.nftData.userWalletNftData);
      } else {
        setError("Error Unable to fetch NFT");
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      setError("Error Unable to fetch NFT");
      setLoading(false);
    }
  };
  return { allNfts, error, loading };
};
