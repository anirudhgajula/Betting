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
  const [mintedNT, setMintedNT] = useState(null);
  const [currentAccount, setCurrentAccount] = useState('');
	const [correctNetwork, setCorrectNetwork] = useState(false);

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
            src="/favicon.ico"
            className='max-w-xs h-auto transition-shadow hover:shadow-xl'
            alt=""
          />
        </div>
        <h2 className='text-3xl font-bold mb-10 text-[#ada6c1]'>
            Mint NewToken. Predict BTC's Future!
        </h2>
        <div className="flex justify-center mb-10 text-2xl rounded-lg hover:scale-105 transition-duration:100ms ease-in-out" >
          <ConnectButton />
        </div>
        <MintNT addr={address}/>
        <TokenBalance addr={address}/>


        <div className='grid grid-cols-2 gap-2 mb-4 text-2xl font-bold justify-start items-centre'>
          <div>BTC Price</div>
          <div>US$16600</div>
        </div>
        <Oracle/>


        <h3 className='font-bold text-l'>
          Do you think the price of Bitcoin will exceed $17,000 by Sunday?
        </h3>
        <h4>
          Yes or no, place bet below!
        </h4>
        <Betting />
      </div>
    </>
    
  )
}
