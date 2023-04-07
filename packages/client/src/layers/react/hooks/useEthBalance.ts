import { useEffect } from "react";
import { useState } from "react";
import { ethers } from "ethers";

const params = new URLSearchParams(window.location.search);
const chainIdString = params.get("chainId");
let rpcUrl;

if (chainIdString == "9874612") {
  rpcUrl = "https://giantleap-test.calderachain.xyz/http";
} else {
  rpcUrl = "https://giantleap-test1.calderachain.xyz/http"; // Chain ID = 344215
}

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

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
