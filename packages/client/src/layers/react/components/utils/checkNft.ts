import { ethers } from "ethers";
import GiantleapTutorialNFT from "./GiantleapTutorialNFT.json";

const provider = new ethers.providers.JsonRpcProvider("https://giantleap-test.calderachain.xyz/http");

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
