import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, 
         useContract, useContractRead, 
         useContractWrite, usePrepareContractWrite, useNetwork, 
         useWaitForTransaction } from 'wagmi';

// Token Imports
import { ethers } from 'ethers'
import BettingContract from '../utils/Betting.json'
import { bettingContractAddress } from '../config.js'

// React and NextJS Imports
import Head from 'next/head'
import MintNT from '../components/MintNT';
import { useState, useEffect } from 'react'
import Betting from '../components/Betting';
import TokenBalance from '../components/TokenBalance';
import Oracle from '../components/Oracle';
import PredictVal from '../components/PredictVal';
import UserDetails from '../components/UserDetails';
import { connect } from 'http2';


// const provider = new ethers.providers.Web3Provider(window.ethereum);
// declare var window : Window;
/*
TODO: Use getStaticProps for BTC Real-time price from Oracle

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  console.log('[HomePage] getStaticProps()');
  const coinInfo = await getCoinInfo();
  return {
    props: { coinInfo },
    revalidate: 300,
  };
};

*/


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
          <img
            src="/HeaderPage.png"
            className='max-w-xs h-auto transition-shadow hover:shadow-xl'
            alt=""
          />
        </div>
        <h2 className='text-3xl font-bold mb-4 text-[#ada6c1]'>
            Predict BTC's Future!
        </h2>
        <div className="flex justify-center mb-4 text-2xl rounded-lg hover:scale-105 transition-duration:100ms ease-in-out" >
          <ConnectButton />
        </div>
        <>
        {connected && (
          <>
            <Oracle/>
            <PredictVal/>
            <UserDetails/>
            <Betting/>
          </>
        )}
        </>
        
      </div>
    </>
    
  )
}
