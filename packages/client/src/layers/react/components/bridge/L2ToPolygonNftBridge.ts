import { ethers } from "ethers";
import { CrossChainMessenger, initializeMessenger, MessageStatus } from "@constellation-labs/sdk";
import { DATA } from "./data";
import L2StandardERC1155 from "./artifacts/L2StandardERC1155.json";

export const L2ToPolygonNftBridge = async (
  metaMaskSigner: any,
  metaMaskAddress: string,
  gamePrivateKey: string,
  tokenId: number
) => {
  // input
  const L2_PRIVATE_KEY = gamePrivateKey;
  const L1_ERC1155_CONTRACT_ADDRESS = "0xfA4F088838A53Cdcc6A9E233Ff60B86c1AFFb07d";
  const L2_ERC1155_CONTRACT_ADDRESS = "0x4aBc486F4a8e35f4cF74B8E3c6bD30D019d3A4F7";

  const urls = DATA.generateURLs("giantleap-test1");
  const L2_URL = urls.L2_HTTP;

  const l2Provider = new ethers.providers.JsonRpcProvider(L2_URL);
  const l2Wallet = new ethers.Wallet(L2_PRIVATE_KEY, l2Provider);
  const messenger: CrossChainMessenger = await initializeMessenger(metaMaskSigner, l2Wallet, "/addresses.json");
  const l2ERC1155 = new ethers.Contract(L2_ERC1155_CONTRACT_ADDRESS, L2StandardERC1155.abi, l2Wallet);

  const amount = 1;

  const before = new Date();
  console.log(
    "L2 ERC1155 pre-balance",
    "tokenId",
    tokenId,
    "amount",
    await l2ERC1155.balanceOf(await l2Wallet.getAddress(), tokenId)
  );

  const withdrawalTx = await messenger.withdrawERC1155(
    L1_ERC1155_CONTRACT_ADDRESS,
    L2_ERC1155_CONTRACT_ADDRESS,
    tokenId,
    amount,
    {
      overrides: {
        gasLimit: 1000000,
        gasPrice: 0,
      },
    }
  );
  console.log("withdrawalTx hash", withdrawalTx.hash);

  await messenger.waitForMessageStatus(withdrawalTx, MessageStatus.READY_FOR_RELAY);
  const finalizeTx = await messenger.finalizeMessage("withdrawalTx", {
    overrides: {
      gasPrice: await metaMaskSigner.getGasPrice(),
      gasLimit: 5_000_000,
    },
  });
  console.log("finalizeTx hash:", finalizeTx.hash);
  await messenger.waitForMessageReceipt(withdrawalTx);

  // after
  const after = new Date();
  console.log("It takes " + (after.getTime() - before.getTime()) / 1000 + " seconds to finish");
  console.log(
    "L2 ERC1155 post-balance",
    "tokenId",
    tokenId,
    "amount",
    ethers.utils.formatUnits(await l2ERC1155.balanceOf(await l2Wallet.getAddress(), tokenId))
  );
};
