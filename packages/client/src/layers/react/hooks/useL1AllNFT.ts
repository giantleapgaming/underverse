import { useEffect, useState } from "react";
interface Image {
  tokenId: number;
  imageUrl: string;
}
export const useL1AllNFT = (walletAddress?: string): { allNfts?: Image[]; loading: boolean; error: string } => {
  const [allNfts, setAllNfts] = useState<Image[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          nftContract: "0xE47118d4cD1F3f9FEEd93813e202364BEA8629b3",
          chainId: 344215,
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
