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
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}