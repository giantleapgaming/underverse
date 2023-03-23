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
    try {
      const balance = await provider.getBalance("0x1f13B18cD505e99bF790593515798FCb74bB186b");
      setBalance(ethers.utils.formatEther(balance));
    } catch (err) {
      console.log(err);
    }
  };
  return { balance };
};
