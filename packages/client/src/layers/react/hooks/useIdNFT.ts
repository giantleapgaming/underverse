import { useEffect, useState } from "react";
interface Image {
  imageUrl: string;
  address: string;
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
          nftContract: "0x5e42fCbB2583CcaD0BaAfb92078b156bd661B93C",
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
