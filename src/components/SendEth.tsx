import { useState, useEffect } from 'react'
import type {AppProps} from './WalletProviders';

export const SendEth = (props: AppProps) => {

  const {userAccount, web3} = props;
  const [to, setTo] = useState('0xF0fC77E79D0a224FD753ee2B452f02447BE6a935');
  const [wei, setWei] = useState('10');

  const [balance, setBalance] = useState('');
  const [sendRes, setSendRes] =
    useState<{success: boolean, msg: string}>();

  useEffect(() => {
    web3.eth.getBalance(userAccount).then(v => setBalance(v.toString(10)))

    web3.eth.subscribe('newHeads').then(subscription => {
      subscription.on('data', async () => {
        // const tx = await web3.eth.getTransaction(txHash);
        // if ((tx.to && tx.to.toLowerCase() === userAccount.toLowerCase()) ||
        //   tx.from.toLowerCase() === userAccount.toLowerCase()) {
        //   web3.eth.getBalance(userAccount).then(v => setBalance(v.toString(10)));
        // }
        web3.eth.getBalance(userAccount).then(v => setBalance(v.toString(10)));
      });
      subscription.on('error', error =>
        console.log('Error when subscribing to New block header: ', error),
      );
    });

    return () => {
      web3.eth.clearSubscriptions();
    };
  }, [userAccount, web3]);

  const sendEth = async () => {
    try {
      // const hash = await selectedWallet.provider.request({
      //   method: 'eth_sendTransaction',
      //   params: [
      //     {
      //       from: userAccount,
      //       to,
      //       value: web3.utils.numberToHex(wei),
      //     }
      //   ]
      // });
      // setSendRes({success: true, msg: hash as string});

      web3.utils.toWei(1000, 'finney')
      const res = web3.eth.sendTransaction({
        from: userAccount,
        to,
        value: web3.utils.toWei(wei, 'finney'),
      }, undefined, {ignoreGasPricing: true, ignoreFillingGasLimit: true});
      res.on('transactionHash', txHash => setSendRes({success: true, msg: `txHash:${txHash}`}))
      res.on('receipt', receipt => setSendRes({success: true, msg: `blockHash:${receipt.blockHash}`}))
      res.on('error', error => setSendRes({success: false, msg: JSON.stringify(error)}))
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
          <span>地址</span>
          <input style={{width: 400}} value={to} onChange={e => setTo(e.target.value)}/>
        </div>
        <div>
          <span>金额(0.001ether)</span>
          <input style={{width: 400}} value={wei} onChange={e => setWei(e.target.value)}/>
        </div>
        <button onClick={sendEth}>
          Send
        </button>
        {sendRes && <div>{`${sendRes.success ? 'success' : 'error'}: ${sendRes.msg}`}</div>}
      </div>
    </>
  )
}

export default SendEth;
