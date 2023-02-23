import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

// React and NextJS Imports
import Head from 'next/head'
import MintNT from '../components/MintNT';
import { useState, useEffect } from 'react'
import TokenBalance from '../components/TokenBalance';
import Image from 'next/image';
import favi from '../public/favicon.ico';

export default function HomePage() {
  const {address} = useAccount();
  const [connected, setConnection] = useState(false);
  useEffect(() => setConnection(String(address) !== "undefined"), [address]);

  return (
    <>
      <Head>
        <title>Bitcoin Price Betting</title>
        <meta name="description" content="Bitcoin Price Betting" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='flex flex-col items-center pt-4 bg-[#1c589d] min-h-full'>
        <div className='transition hover:rotate-180 transition-duration:100ms ease-in-out scale-75'>
          <Image
            src={favi}
            alt=""
            width={400}
            height={400}
          />
        </div>
        <h2 className="text-3xl font-bold mb-10 text-[#ada6c1]">
          Mint NewToken. Predict BTC&apos;s Future!
        </h2>
        <div className="flex justify-center mb-10 text-2xl rounded-lg hover:scale-105 transition-duration:100ms ease-in-out" >
          <ConnectButton />
        </div>
        <>
        {connected && (
          <>
            <MintNT addr={address}/>
            <TokenBalance addr={address}/>
          </>
        )}
        </>
      </div>
    </>
  )
}
