import { useState } from 'react'
import type {AppProps} from './WalletProviders';
import {Buffer} from 'buffer';
import {SiweMessage} from 'siwe';

export const Sign = (props: AppProps) => {

  const {userAccount, web3} = props;

  const [siweSignRes, setSiweSignRes] =
    useState<{success: boolean, msg: string}>();

  const siweSign = async () => {
    try {
      const domain = window.location.host;
      const siweMsg = new SiweMessage({
        domain,
        address: userAccount,
        statement: 'This is a test statement.',
        uri: origin ?? `https://${domain}`,
        version: '1',
        chainId: 1
      }).prepareMessage();
      const msg = `0x${Buffer.from(siweMsg, "utf8").toString("hex")}`;
      const res = await web3.eth.personal.sign(msg, userAccount, '');
      setSiweSignRes({success: true, msg: res})
    } catch (error) {
      console.log('error', error)
      setSiweSignRes({success: false, msg: JSON.stringify(error)});
    }
  }

  return (
    <>
      <div>
        <button onClick={siweSign}>
          SiweSign
        </button>
        {siweSignRes && <div>{`${siweSignRes.success ? 'success' : 'error'}: ${siweSignRes.msg}`}</div>}
      </div>
    </>
  )
}

export default Sign;
