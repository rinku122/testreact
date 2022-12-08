import "./App.css";
import React, { useEffect, useState } from "react";
import ContractService from "./services/ContractFun";
import Loading from "react-js-loader";

const App = () => {
  const { ethereum } = window;
  const [totalsupply, setTotalSupply] = useState("");
  const [userMindpayBalance, setUserMindpayBalance] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputDisable, setInputDisable] = useState(false);
  const [loader, setLoader] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [logs, setLogs] = useState([]);

  // Not done with the best pracice , but i am having a time boundation.

  useEffect(() => {
    connectWallet();
    getLogs();
    ethereum?.on("accountsChanged", (account) => {
      setWalletAddress(account[0]);
    });
  }, []);

  const getLogs = async () => {
    const _logs = await ContractService.getLogs();
    setLogs(_logs);
  };

  const connectWallet = async () => {
    if (typeof ethereum !== "undefined") {
      try {
        ContractService.callWeb3Contract(ethereum);
        const account = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(account[0]);
        setLoader(true);
        getBalance(account[0]);
        totalSupply();
        setLoader(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("you don't have installed metamask");
    }
  };

  const totalSupply = async () => {
    try {
      const supply = await ContractService.totalSupply();
      setTotalSupply(supply / 10 ** 18);
    } catch (error) {
      console.log(error);
    }
  };

  const getBalance = async (user) => {
    try {
      const balance = await ContractService.getBalance(user);
      setUserMindpayBalance(balance);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setInputDisable(true);
  };

  const cancelInvestment = async (e) => {
    try {
      e.preventDefault();
      setLoader(true);
      const eligible = await ContractService.checkEligibility(walletAddress);
      if (!eligible) {
        setLoader(false);
        return alert("No investment found");
      }
      const response = await ContractService.cancelInvestment(walletAddress);
      if (!response) {
        setLoader(false);
        return alert("Locking period not over");
      }
      window.location.reload();
    } catch (error) {
      alert("Locking period not over");
      console.log(error);
    }
  };

  const stakeInvestment = async (e) => {
    try {
      e.preventDefault();
      setLoader(true);
      const eligible = await ContractService.checkEligibility(walletAddress);
      if (!eligible) {
        setLoader(false);
        return alert("No investment found");
      }
      const response = await ContractService.stakeInvestment(walletAddress);
      if (!response) {
        setLoader(false);
        return alert("Locking period not over");
      }
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const investment = async (e) => {
    try {
      e.preventDefault();

      if (inputValue === "") {
        return alert("Eth amount can't be empty");
      }

      if (walletAddress === "") {
        return alert("Please connect metamask first");
      }
      setLoader(true);

      const eligible = await ContractService.checkEligibility(walletAddress);

      if (eligible) {
        setLoader(false);

        return alert(
          "Not eligible,for investment user has to stake or cancel investment first"
        );
      }

      await ContractService.invest(walletAddress, inputValue);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {loader && (
        <div className="loaderDivOuter">
          <Loading
            type="bubble-ping"
            bgColor={"#3b9ff0"}
            color={"#3b9ff0"}
            size={80}
          />
        </div>
      )}
      <p>User Address : {walletAddress}</p>
      <form>
        <input
          type="text"
          placeholder="Enter ETH"
          onChange={handleChange}
          required
        />{" "}
        &nbsp;
        <input
          type="text"
          placeholder={inputValue ? inputValue * 1000 : "show equal mind pay"}
          disabled={true}
          readOnly={true}
        />{" "}
        <br /> <br />
        <button onClick={investment} className="bgColor">
          Invest into MINDPAY
        </button>{" "}
        &nbsp;
        <br /> <br />
        <span>Total supply of mindpay</span> :{" "}
        <input
          type="text"
          readOnly={true}
          placeholder="Total supply of MINDPAY"
          value={totalsupply}
        />{" "}
        <br /> <br />
        <span>User Mindpay balance</span> :{" "}
        <input
          type="text"
          readOnly={true}
          placeholder=" MINDPAY balance of user"
          value={userMindpayBalance}
        />{" "}
        &nbsp;
        <button onClick={cancelInvestment} className="bgColor">
          Cancel Investment
        </button>{" "}
        &nbsp; &nbsp;
        <button onClick={stakeInvestment} className="bgColor">
          Stake your Investment
        </button>
      </form>

      <h1 className="heading">Transaction Lists</h1>
      <table>
        <thead>
          <tr>
            <th>Tokens</th>
            <th>Status</th>
            <th>Transaction id with link to ether scan</th>
          </tr>
        </thead>
        {logs.map((elem, index) => (
          <tbody key={index}>
            <tr>
              <td>{elem.tokens}</td>
              <td>Confirmed</td>
              <td>
                <a
                  style={{ color: "black" }}
                  target="_blank"
                  href={elem.hash}
                  rel="noreferrer"
                >
                  Click for transaction
                </a>{" "}
              </td>
            </tr>
          </tbody>
        ))}
      </table>
    </>
  );
};

export default App;
