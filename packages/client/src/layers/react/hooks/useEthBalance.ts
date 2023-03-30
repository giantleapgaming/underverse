import { useEffect } from "react";
import { useState } from "react";
import { ethers } from "ethers";
const provider = new ethers.providers.JsonRpcProvider("https://follower.testnet-chain.linfra.xyz");

// Get the user's ETH balance
export const useEthBalance = (address?: string) => {
  const [balance, setBalance] = useState("-");
  useEffect(() => {
    if (address) {
      setInterval(() => {
        getEthBalance();
      }, 5000);
    }
  }, []);
  const getEthBalance = async () => {
    if (address) {
      try {
        const balance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(balance));
      } catch (err) {
        console.log(err);
      }
    }
  };
  return { balance };
};
