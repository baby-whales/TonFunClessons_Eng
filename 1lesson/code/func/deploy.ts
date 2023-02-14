import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import * as fs from "fs";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, Cell, WalletContractV4 } from "ton";

import Lesson1 from "./lesson1"; // this is the interface class from step 7

const YOUR_API_KEY = "67d0b5abb18135b235302a94f9e47303ddfe14c5bbb1c2e35dc9485baa2d3438";

async function deploy() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  //const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });
  //const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", 
  //  apiKey: YOUR_API_KEY 
  //});

  // prepare Counter's initial code and data cells for deployment
  const lesson1Code = Cell.fromBoc(fs.readFileSync("code.cell"))[0]; // compilation output from step 6
  const initialCounterValue = 1;//0;//Date.now(); // to avoid collisions use current number of milliseconds since epoch as initial value
  const lesson1 = Lesson1.createForDeploy(lesson1Code, initialCounterValue);
  
  // exit if contract is already deployed
  console.log("contract address:", lesson1.address.toString());
  if (await client.isContractDeployed(lesson1.address)) {
    return console.log("lesson1 already deployed");
  }

  // open wallet v4 (notice the correct wallet version here)
  //const mnemonic = process.env.MNEMONIC;
  //const mnemonic = "best tommorow shrug claw stern melt dragon rule wish witness era stuff shoot quiz trial scatter release cheese casino divert brick arch sing olive";
  const mnemonic = "wisdom alone process shift join velvet lend obtain myth captain bright version moon sorry gentle sweet brass town poet ceiling horn roast speak shy";
  const key = await mnemonicToWalletKey(mnemonic!.split(" "));
  console.log("key:",key);
  console.log("secret key:", key.secretKey.toString("hex"));
  console.log("public key:", key.publicKey.toString("hex"));
  
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  // if (!await client.isContractDeployed(wallet.address)) {
  //   return console.log("wallet is not deployed");
  // }
  console.log("wallet address:", wallet.address.toString());
  const walletRes = await client.isContractDeployed(wallet.address);
  console.log("walletRes:", walletRes);
  if (!walletRes) {
    return console.log("wallet is not deployed");
  } 

  // open wallet and read the current seqno of the wallet
  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();
  
  // send the deploy transaction
  const lesson1Contract = client.open(lesson1);
  await lesson1Contract.sendDeploy(walletSender);

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for deploy transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("deploy transaction confirmed!");
}

deploy();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}