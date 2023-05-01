import { ethers } from "ethers";
import GiantleapTutorialNFT from "./GiantleapTutorialNFT.json";

const params = new URLSearchParams(window.location.search);
const chainIdString = params.get("chainId");
let rpcUrl;

if (chainIdString == "9874612") {
  rpcUrl = "https://giantleap-test.calderachain.xyz/http";
} else {
  rpcUrl = "https://giantleap-test1.calderachain.xyz/http"; // Chain ID = 344215
}

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

export const checkNft = async (nftContractAddress: string, address?: string): Promise<boolean | undefined> => {
  const userAddressArr = [],
    tokenId = [];
  for (let i = 0; i < 3000; i++) {
    userAddressArr.push(address);
    tokenId.push(i);
  }
  const nftContract = new ethers.Contract(nftContractAddress, GiantleapTutorialNFT, provider);
  try {
    const balance = await nftContract.balanceOfBatch(userAddressArr, tokenId);
    for (let i = 0; i < balance.length; i++) {
      if (balance[i] != 0) {
        return true;
      }
    }
  } catch (e) {
    console.log(e);
  }
};
