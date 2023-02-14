import { Contract, ContractProvider, Sender, Address, Cell, contractAddress, beginCell } from "ton-core";

export default class Lesson1 implements Contract {

  static createForDeploy(code: Cell, initialCounterValue: number): Lesson1 {
    const data = beginCell()
      .storeUint(initialCounterValue, 64)
      .endCell();
    const workchain = 0; // deploy to workchain 0
    const address = contractAddress(workchain, { code, data });
    return new Lesson1(address, { code, data });
  }
  
  constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) {}

  async sendDeploy(provider: ContractProvider, via: Sender) {
    console.log("Lesson1: sendDeploy");
    await provider.internal(via, {
      value: "0.01", // send 0.01 TON to contract for rent
      bounce: false
    });
  } 

  async getTotal(provider: ContractProvider) {
    const { stack } = await provider.get("get_total", []);
    return stack.readBigNumber();
  }  
}