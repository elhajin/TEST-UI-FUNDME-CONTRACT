// address contract on goerli network : 0x42E410666Dd4909cEC1A5D38397364941ec19e42
//  importing ethers library and and contract address and abi:
import { ethers } from "./ethers.js";
import { abi, address } from "./abi.js";

// set buttons for write functions:
const Connect = document.getElementById("connectButton");
const Fund = document.getElementById("fund");
const Withdraw = document.getElementById("withdraw");
Connect.onclick = connect; //note if you add () here metamask gonna pop-up when ever you open the browser
Fund.onclick = fund;
Withdraw.onclick = withdraw;
// set buttons for read functions:
const OWNER = document.getElementById("owner");
const FUNDER = document.getElementById("getFunder");
const amountFunded = document.getElementById("addressToAmount");
const Balance = document.getElementById("balance");
OWNER.onclick = owner;
FUNDER.onclick = getFunder;
amountFunded.onclick = addressToAmount;
Balance.onclick = GetBalance;

// create a global contract and singer objects
let Fundme;
let signer;
async function func() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  Fundme = new ethers.Contract(address, abi, signer);
}

// write functions:

async function connect() {
  func();
  if (typeof window.ethereum !== "undefined") {
    console.log("there is a metamask wallet.");
    await ethereum.request({ method: "eth_requestAccounts" });

    document.getElementById("connectButton").innerHTML = "Connected";
    try {
      document.getElementById(
        "connectedto"
      ).innerHTML = `Connected to ${await signer.getAddress()}`;
    } catch (error) {
      document.getElementById("connectedto").innerHTML = `Not connected!!`;
    }
  } else {
    console.log("there is no metamask wallet ");
    document.getElementById("connectButton").innerHTML = "No Wallet";
  }
}

// fund function that allow users to fund the owner :
async function fund() {
  func();

  if (window.ethereum !== "undefined") {
    let amount = document.getElementById("funding").value;
    amount = ethers.utils.parseEther(amount.toString());
    const signerAddress = await signer.getAddress();
    console.log("before address to amount ");
    const funderFund = await Fundme.getAddressToAmountFunded(signerAddress);
    document.getElementById("getFunded").innerHTML = `
     you funded since now: ${ethers.utils.formatEther(
       funderFund.toString()
     )}ETH`;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tx = await Fundme.fund({ value: amount.toString() });
      await listen(tx, provider);
      console.log("the trnsaction done");
      const lfunderFund = await Fundme.getAddressToAmountFunded(signerAddress);
      document.getElementById("getFunded").innerHTML = `
     you funded since now: ${ethers.utils.formatEther(
       lfunderFund.toString()
     )}ETH`;
    } catch (error) {
      console.log(error);
    }
  }
}

// create an listen function (to check when the tx confirmed):
function listen(txResponse, provider) {
  console.log(`Mining ${txResponse.hash}`);
  return new Promise((resolve, reject) => {
    try {
      provider.once(txResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        );
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

// withdraw function :
async function withdraw() {
  const withdraw = await Fundme.cheaperWithdraw();
}
// read functions  :

async function owner() {
  func();
  const own = await Fundme.getOwner();

  document.getElementById(
    "ownerAddress"
  ).innerHTML = `address owner of this contract :${own}`;
}

async function getFunder() {
  func();
  const id = document.getElementById("idInput").value;
  const getFunder = await Fundme.getFunder(id);
  document.getElementById(
    "funderresult"
  ).innerHTML = `funder id ${id} \n address: ${getFunder}`;
}

async function addressToAmount() {
  const add = document.getElementById("addresstoamount").value;
  const addressToFunds = await Fundme.getAddressToAmountFunded(add);
  document.getElementById(
    "addresstoamountresult"
  ).innerHTML = `this address funded ${ethers.utils.formatEther(
    addressToFunds.toString()
  )} ETH`;
}

async function GetBalance() {
  func();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const bal = await provider.getBalance(
    "0x42E410666Dd4909cEC1A5D38397364941ec19e42"
  );
  document.getElementById("getbalance").innerHTML = `${ethers.utils.formatEther(
    bal
  )} ETH`;
}
