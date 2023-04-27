import { useEffect, useState } from "react";
import { ethers } from "ethers";

interface Image {
  tokenId: number;
  imageUrl: string;
}
export const usePolygonIdNFTData = (): {
  allNfts?: Image[];
  loading: boolean;
  error: string;
  setCurrentAccount: (address: string) => void;
} => {
  const [allNfts, setAllNfts] = useState<Image[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | undefined>();

  useEffect(() => {
    if (currentAccount) {
      fetchData();
    }
  }, [currentAccount]);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ethereum = window.ethereum as any;
    const provider = new ethers.providers.Web3Provider(ethereum);

    ethereum.on("accountsChanged", (accounts: string) => {
      setCurrentAccount(accounts[0]);
    });

    // Set the initial account
    provider
      .getSigner()
      .getAddress()
      .then((address) => {
        setCurrentAccount(address);
      });
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.giantleap.gg/api/l1-nfts", {
        method: "POST",
        body: JSON.stringify({
          address: currentAccount,
          nftContract: "0xC2c59d9C945C19FC82A2d771AC2B84A665d2300E",
          chainId: 137,
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
  return { allNfts, error, loading, setCurrentAccount };
};
