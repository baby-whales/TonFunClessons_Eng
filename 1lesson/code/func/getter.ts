import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "ton";
import Lesson1 from "./lesson1"; // this is the interface class we just implemented

// 1
//const MY_CONTRACT_ADDRESS = "EQDVNK8WObwWUb2qeIF8PFfckh7SM9kjV68JsYDq2ifwKo6d";

//
const MY_CONTRACT_ADDRESS = "EQDG9r_tyIWxYjjuJ7tqpdr3s76jTdJypSTWoyfH4WIoHnKz";


async function main() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  const client = new TonClient({ endpoint });
  //const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" });

  // open Counter instance by address

  //const counterAddress = Address.parse(process.env.COUNTER_ADDRESS!);
  const lesson1Address = Address.parse(MY_CONTRACT_ADDRESS);
  const lesson1 = new Lesson1(lesson1Address);
  const lesson1Contract = client.open(lesson1);

  // call the getter on chain
  const totalValue = await lesson1Contract.getTotal();
  console.log("value:", totalValue.toString());
}

main();