import 'styles/globals.css';
import type { AppProps } from 'next/app';
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

import {
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';

import { mainnet, goerli, sepolia} from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import NavBar from '../components/NavBar';

const { chains, provider } = configureChains(
  [mainnet, goerli, sepolia],
  [
    infuraProvider({ apiKey: process.env.INFURA_API_KEY as string }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Betting Contract',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="mx-auto bg-[#1c589d]">
      <NavBar></NavBar>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
    
  );
}