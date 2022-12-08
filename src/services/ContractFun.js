import Web3 from "web3";
import abi from "../abi.json";

const contractAddress = "0x12e9a9dcDc8f276c71524Ddd102343525ddAbB26";
const staking = "0x3421DfD649B31F5bB48528368A68351014b5029E";
//staki

const link = "https://goerli.etherscan.io/tx/";
const blockNumber = 8096126;
class ContractService {
  contractObject;
  web3Object;

  /**
   * call Web3
   * @param  {any} provider
   */
  callWeb3Contract(provider) {
    this.web3Object = new Web3(provider);
    this.contractObject = new this.web3Object.eth.Contract(
      abi,
      contractAddress
    );
    return {
      web3Instance: this.web3Object,
      contractInstance: this.contractInstance,
    };
  }

  callContract() {
    if (this.contractObject) {
      return this.contractObject;
    }
    this.contractObject = new this.web3Object.eth.Contract(
      abi,
      contractAddress
    );
    return this.contractObject;
  }

  callWeb3(provider) {
    if (this.web3Object) {
      return this.web3Object;
    }
    this.web3Object = new Web3(provider);
    return this.web3Object;
  }

  async calculateGasPrice() {
    try {
      return await this.web3Object.eth.getGasPrice();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async cancelInvestment(walletAddress) {
    try {
      const contract = await this.callContract();
      const gasPrice = await this.calculateGasPrice();
      const gas = await contract.methods
        .cancelInvestment()
        .estimateGas({ from: walletAddress });

      await contract.methods
        .cancelInvestment()
        .send({ from: walletAddress, gasPrice, gas });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async stakeInvestment(walletAddress) {
    try {
      const contract = await this.callContract();
      const gasPrice = await this.calculateGasPrice();
      const gas = await contract.methods
        .stakeInvestment()
        .estimateGas({ from: walletAddress });

      await contract.methods
        .stakeInvestment()
        .send({ from: walletAddress, gasPrice, gas });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async converToWei(value) {
    const weiValue = this.web3Object.utils.toWei(value, "ether");
    return weiValue;
  }

  async invest(walletAddress, amount) {
    try {
      amount = await this.converToWei(amount);
      const contract = await this.callContract();
      const gasPrice = await this.calculateGasPrice();

      const gas = await contract.methods
        .invest()
        .estimateGas({ from: walletAddress, value: amount });
      await contract.methods
        .invest()
        .send({ from: walletAddress, gasPrice, gas, value: amount });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async totalSupply() {
    try {
      const contract = this.callContract();
      const supply = await contract?.methods?.totalSupply().call();
      return supply;
    } catch (error) {
      console.log(error);
    }
  }

  async getBalance(user) {
    try {
      const contract = this.callContract();
      const balance = await contract?.methods?.balanceOf(user).call();
      return balance;
    } catch (error) {
      console.log(error);
    }
  }

  async checkEligibility(user) {
    try {
      const contract = this.callContract();
      const eligible = await contract?.methods
        ?.eligibleForInvestment(user)
        .call();
      return eligible;
    } catch (error) {
      console.log(error);
    }
  }

  async getLogs() {
    const contract = this.callContract();

    const event = await contract.getPastEvents("Transfer", {
      fromBlock: blockNumber,
    });
    if (event.length > 0) {
      let arrayVal = [];
      for (let obj of event) {
        let object = {};
        object.hash = `${link}${obj.transactionHash}`;
        object.tokens = obj.returnValues.value / 10 ** 18;
        arrayVal.push(object);
      }
      return arrayVal;
    } else {
      return [];
    }
  }
}

export default new ContractService();
