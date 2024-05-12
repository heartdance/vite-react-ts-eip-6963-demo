import {useState, useEffect, useRef, useCallback} from 'react'
import type {AppProps} from './WalletProviders';

const contractABI = [{"inputs": [], "stateMutability": "nonpayable", "type": "constructor"}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "from", "type": "address"}, {
    "indexed": false,
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
  "name": "Sent",
  "type": "event"
}, {
  "inputs": [{"internalType": "address", "name": "", "type": "address"}],
  "name": "balances",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "receiver", "type": "address"}, {
    "internalType": "uint256",
    "name": "amount",
    "type": "uint256"
  }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
  "inputs": [],
  "name": "minter",
  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "receiver", "type": "address"}, {
    "internalType": "uint256",
    "name": "amount",
    "type": "uint256"
  }], "name": "send", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}];

const contractAddress = '0x6Fc7D14341Ae4fcc793a36B0C455cCC4EcC68569';

export const SendEth = (props: AppProps) => {

  const {userAccount, web3} = props;
  const [mintAmount, setMintAmount] = useState('10');
  const [sendTo, setSendTo] = useState('0xF0fC77E79D0a224FD753ee2B452f02447BE6a935');
  const [sendAmount, setSendAmount] = useState('10');

  const [balance, setBalance] = useState('');

  const [mintRes, setMintRes] =
    useState<{ success: boolean, msg: string }>();
  const [sendRes, setSendRes] =
    useState<{ success: boolean, msg: string }>();

  const contractRef = useRef(new web3.eth.Contract(contractABI, contractAddress));

  const updateBalance = useCallback(() => {
    contractRef.current.methods.balances(userAccount).call()
      .then(v => setBalance((v as unknown as bigint).toString(10)));
  }, [userAccount])

  useEffect(() => {
    updateBalance();
    web3.eth.subscribe('logs', {address: contractAddress}).then(subscription => {
      subscription.on('data', async logs => {
        console.log(logs);
        updateBalance();
      });
      subscription.on('error', error =>
        console.log('Error when subscribing to New block header: ', error),
      );
    });

    return () => {
      web3.eth.clearSubscriptions();
    };
  }, [web3, updateBalance]);

  const mint = async () => {
    try {
      const res = await contractRef.current.methods
        .mint(userAccount, mintAmount)
        .send({from: userAccount});
      setMintRes({success: true, msg: res.transactionHash});
      updateBalance();
    } catch (error) {
      console.log('error', error)
      setMintRes({success: false, msg: JSON.stringify(error)});
    }
  }

  const send = async () => {
    try {
      const res = await contractRef.current.methods
        .send(sendTo, sendAmount)
        .send({from: userAccount});
      setSendRes({success: true, msg: res.transactionHash});
    } catch (error) {
      console.log('error', error)
      setSendRes({success: false, msg: JSON.stringify(error)});
    }
  }

  return (
    <>
      <div>
        <div>
          <span>余额</span>
          <span>{balance}</span>
        </div>

        <div>
          <span>金额</span>
          <input style={{width: 400}} value={mintAmount} onChange={e => setMintAmount(e.target.value)}/>
        </div>
        <button onClick={mint}>
          Mint
        </button>
        {mintRes && <div>{`${mintRes.success ? 'hash' : 'error'}: ${mintRes.msg}`}</div>}

        <div>
          <span>地址</span>
          <input style={{width: 400}} value={sendTo} onChange={e => setSendTo(e.target.value)}/>
        </div>
        <div>
          <span>金额</span>
          <input style={{width: 400}} value={sendAmount} onChange={e => setSendAmount(e.target.value)}/>
        </div>
        <button onClick={send}>
          Send
        </button>
        {sendRes && <div>{`${sendRes.success ? 'hash' : 'error'}: ${sendRes.msg}`}</div>}
      </div>
    </>
  )
}

export default SendEth;
