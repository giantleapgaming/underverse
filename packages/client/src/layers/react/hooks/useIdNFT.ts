import { useEffect, useState } from "react";
interface Image {
  nftData: string;
}
export const useIdNFTData = (tokenId: number): { nftData?: Image; loading: boolean; error: string } => {
  const [nftData, setAllNfts] = useState<Image | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = new URLSearchParams(window.location.search);
  const chainIdString = params.get("chainId");

  useEffect(() => {
    if (typeof tokenId === "number") {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.giantleap.gg/api/user-nfts", {
        method: "POST",
        body: JSON.stringify({
          nftContract: "0x3e2D7736aB18aBABDc4C377F63d58B1421cDAc12",
          chainId: chainIdString,
          nftTokenId: tokenId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status) {
        setAllNfts(data);
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
  return { nftData, error, loading };
};
