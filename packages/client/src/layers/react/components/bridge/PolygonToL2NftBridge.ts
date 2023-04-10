import { ethers, Wallet } from "ethers";
import { CrossChainMessenger, initializeMessenger, MessageStatus } from "@constellation-labs/sdk";
import { DATA } from "./data";
import L2StandardERC1155 from "./artifacts/L2StandardERC1155.json";
import GiantleapNft_ABI from "./artifacts/GiantleapNft.json";

export const PolygonToL2NftBridge = async (metaMaskSigner: any, metaMaskAddress: string, gamePrivateKey: string) => {
  const L1_URL = "https://polygon-rpc.com/";

  const L2_PRIVATE_KEY = gamePrivateKey;
  const L1_ERC1155_CONTRACT_ADDRESS = "0xfA4F088838A53Cdcc6A9E233Ff60B86c1AFFb07d";
  const L2_ERC1155_CONTRACT_ADDRESS = "0x4aBc486F4a8e35f4cF74B8E3c6bD30D019d3A4F7";

  const urls = DATA.generateURLs("giantleap-test1");
  const L2_URL = urls.L2_HTTP;
  const ADDRESS_ENDPOINT = urls.ADDRESS_ENDPOINT;

  // setup messenger(sdk)
  const l1Provider = new ethers.providers.JsonRpcProvider(L1_URL);
  // const l1Wallet = new ethers.Wallet(signer, l1Provider);
  const l2Provider = new ethers.providers.JsonRpcProvider(L2_URL);
  const l2Wallet: Wallet = new ethers.Wallet(L2_PRIVATE_KEY, l2Provider);
  const messenger: CrossChainMessenger = await initializeMessenger(metaMaskSigner, l2Wallet, ADDRESS_ENDPOINT);
  const l1ERC1155 = new ethers.Contract(L1_ERC1155_CONTRACT_ADDRESS, GiantleapNft_ABI, metaMaskSigner);
  const l2ERC1155 = new ethers.Contract(L2_ERC1155_CONTRACT_ADDRESS, L2StandardERC1155.abi, l2Wallet);

  console.log("NFT minting in progress");

  // mint
  const tokenId = 0;
  const amount = 1;

  const before = new Date();
  const approvalTx = await l1ERC1155.setApprovalForAll(messenger.contracts.l1.L1ERC1155Bridge.address, true, {
    gasLimit: 500000,
    gasPrice: await l1Provider.getGasPrice(),
    type: 0,
  });
  console.log("approveTx hash", approvalTx.hash);

  console.log(
    "L1 ERC1155 pre-balance",
    "tokenId",
    tokenId,
    "amount",
    ethers.utils.formatUnits(await l1ERC1155.balanceOf(metaMaskAddress, tokenId))
  );
  console.log(
    "L2 ERC1155 pre-balance",
    "tokenId",
    tokenId,
    "amount",
    ethers.utils.formatUnits(await l2ERC1155.balanceOf(metaMaskAddress, tokenId))
  );

  const depositTx = await messenger.depositERC1155(
    L1_ERC1155_CONTRACT_ADDRESS,
    L2_ERC1155_CONTRACT_ADDRESS,
    tokenId,
    amount,
    {
      overrides: {
        gasLimit: 1000000,
        gasPrice: await l1Provider.getGasPrice(),
      },
    }
  );
  console.log("depositTx hash", depositTx.hash);

  await messenger.waitForMessageStatus(depositTx, MessageStatus.RELAYED);

  // after
  const after = new Date();
  console.log("It takes " + (after.getTime() - before.getTime()) / 1000 + " seconds to finish");
  console.log(
    "L1 ERC1155 post-balance",
    "tokenId",
    tokenId,
    "amount",
    ethers.utils.formatUnits(await l1ERC1155.balanceOf(metaMaskAddress, tokenId))
  );
  console.log(
    "L2 ERC1155 post-balance",
    "tokenId",
    tokenId,
    "amount",
    ethers.utils.formatUnits(await l2ERC1155.balanceOf(l2Wallet.address, tokenId))
  );
};
