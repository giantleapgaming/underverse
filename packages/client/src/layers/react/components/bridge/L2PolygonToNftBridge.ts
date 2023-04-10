import { ethers } from "ethers";
import { CrossChainMessenger, initializeMessenger, MessageStatus } from "@constellation-labs/sdk";
import { DATA } from "./data";
import L2StandardERC1155 from "./artifacts/L2StandardERC1155.json";

export const L2PolygonToNftBridge = async () => {
  // input
  const L1_URL = "https://polygon-mainnet.g.alchemy.com/v2/GVHy1QYi6r-r1SAI3iK6zU6kpvnjrfdA";
  const L1_PRIVATE_KEY = "0xc833eb762864b993ee715afb7e3f1a38923c0068eea9c24581023e9690f00cf5"; // address 0x409cF66907983eFA7b01236A4ad789c59a18d9D1
  const L2_PRIVATE_KEY = "0xc833eb762864b993ee715afb7e3f1a38923c0068eea9c24581023e9690f00cf5"; // address 0x409cF66907983eFA7b01236A4ad789c59a18d9D1
  const L1_ERC1155_CONTRACT_ADDRESS = "0x0d2ce95942863403bf281e1c7072d6f69c3248a5";
  const L2_ERC1155_CONTRACT_ADDRESS = "0xfB8b3A52A12A5Fd934A0905a0B08D3F252F179a1";

  const urls = DATA.generateURLs("giantleap-test1");
  const L2_URL = urls.L2_HTTP;
  const ADDRESS_ENDPOINT = urls.ADDRESS_ENDPOINT;

  // setup messenger(sdk)
  const l1Provider = new ethers.providers.JsonRpcProvider(L1_URL);
  const l1Wallet = new ethers.Wallet(L1_PRIVATE_KEY, l1Provider);
  const l2Provider = new ethers.providers.JsonRpcProvider(L2_URL);
  const l2Wallet = new ethers.Wallet(L2_PRIVATE_KEY, l2Provider);
  const messenger: CrossChainMessenger = await initializeMessenger(l1Wallet, l2Wallet, ADDRESS_ENDPOINT);
  const l2ERC1155 = new ethers.Contract(L2_ERC1155_CONTRACT_ADDRESS, L2StandardERC1155.abi, l2Wallet);

  const tokenId = 42069;
  const amount = 69420;

  const before = new Date();
  console.log(
    "L2 ERC1155 pre-balance",
    "tokenId",
    tokenId,
    "amount",
    ethers.utils.formatUnits(await l2ERC1155.balanceOf(await l2Wallet.getAddress(), tokenId))
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
      gasPrice: await l1Provider.getGasPrice(),
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
