import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders'
import { formatAddress } from '~/utils'
import Web3 from 'web3'
import SendEth from './SendEth'
import Coin from './Coin'
import Sign from './Sign'

export type AppProps = {
  selectedWallet: EIP6963ProviderDetail;
  userAccount: string;
  web3: Web3;
}

export const DiscoverWalletProviders = () => {

  const [app, setApp] = useState('sendEth');

  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')
  const [web3, setWeb3] = useState<Web3>()

  const providers = useSyncProviders()

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      setSelectedWallet(providerWithInfo);

      const web3= new Web3(providerWithInfo.provider);
      setWeb3(web3);

      // const accounts = await web3.eth.requestAccounts();
      const accounts = await web3.eth.getAccounts();
      // const accounts = await providerWithInfo.provider.request({
      //   method: 'eth_requestAccounts'
      // });
      setUserAccount(accounts?.[0]);
    } catch (error) {
      console.error(error);
    }
  }

  const isConnected = () => {
    return selectedWallet && userAccount && web3;
  }

  const renderAppSelect = (): React.ReactNode => {
    if (!isConnected()) {
      return null;
    }
    return (
      <div>
        {['sendEth', 'coin', 'sign'].map(v => (
          <span key={v}>
            <input
              type="radio"
              value={v}
              checked={app === v}
              onChange={e => setApp(e.target.value)}
            />
            <span>{v}</span>
          </span>
        ))}
      </div>
    );
  }

  const renderApp = (): React.ReactNode => {
    if (!isConnected()) {
      return null;
    }
    const appProps: AppProps = {selectedWallet, userAccount, web3};
    if (app === 'sendEth') {
      return <SendEth {...appProps} />
    }
    if (app === 'coin') {
      return <Coin {...appProps} />
    }
    if (app === 'sign') {
      return <Sign {...appProps} />
    }
    return null;
  }

  return (
    <>
      <h2>Wallets Detected:</h2>
      <div>
        {
          providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail) => (
              <button key={provider.info.uuid} onClick={() => handleConnect(provider)}>
                <img src={provider.info.icon} alt={provider.info.name}/>
                <div>{provider.info.name}</div>
              </button>
            )) :
            <div>
              No Announced Wallet Providers
            </div>
        }
      </div>
      <hr/>
      <h2>{userAccount ? "" : "No "}Wallet Selected</h2>
      {userAccount &&
          <div>
              <div>
                  <img src={selectedWallet.info.icon} alt={selectedWallet.info.name}/>
                  <div>{selectedWallet.info.name}</div>
                  <div>({formatAddress(userAccount)})</div>
              </div>
          </div>
      }
      {renderAppSelect()}
      {renderApp()}
    </>
  )
}