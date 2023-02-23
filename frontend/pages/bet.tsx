import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

// React and NextJS Imports
import Head from 'next/head'
import { useState, useEffect } from 'react'
import Betting from '../components/Betting';
import TokenBalance from '../components/TokenBalance';
import Oracle from '../components/Oracle';
import PredictVal from '../components/PredictVal';
import UserDetails from '../components/UserDetails';
import Image from 'next/image';
import HeaderPage from '../public/HeaderPage.png';

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
            src={HeaderPage}
            alt=""
            width={500}
            height={350}
          />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-[#ada6c1]">
          Predict BTC&apos;s Future!
        </h2>
        <div className="flex justify-center mb-4 text-2xl rounded-lg hover:scale-105 transition-duration:100ms ease-in-out" >
          <ConnectButton />
        </div>
        <>
        {connected && (
          <>
            <TokenBalance addr={address}/>
            <Oracle/>
            <PredictVal/>
            <Betting/>
            <UserDetails/>
          </>
        )}
        </>
      </div>
    </>
  )
}
