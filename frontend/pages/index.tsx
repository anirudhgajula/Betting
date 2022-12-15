import Head from 'next/head'
import Title from '../components/Page'
import { useState, useEffect } from 'react'
import { bettingContractAddress, tokenContractAddress } from '../config.js'
import { ethers } from 'ethers'
import BettingContract from '../utils/Betting.json'
import NewToken from '../utils/NewToken.json'

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

const connectWallet = async() => {

}

const mintNewToken = async() => {

}

export default function HomePage() {
  const [mintedNT, setMintedNT] = useState(null);
  const [currentAccount, setCurrentAccount] = useState('');
	const [correctNetwork, setCorrectNetwork] = useState(false);

  /*const checkIfWalletIsConnected = async () => {
		const { ethereum } = window
		if (ethereum) {
			console.log('Got the ethereum obejct: ', ethereum)
		} else {
			console.log('No Wallet found. Connect Wallet')
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' })

		if (accounts.length !== 0) {
			console.log('Found authorized Account: ', accounts[0])
			setCurrentAccount(accounts[0])
		} else {
			console.log('No authorized account found')
		}
	}*/

  return (
    <>
      <Head>
        <title>Bitcoin Price Betting</title>
        <meta name="description" content="Bitcoin Price Betting" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='flex flex-col items-center pt-8 bg-[#0e61bf] min-h-screen'>
        <div className='transition hover:rotate-180 transition-duration:100ms ease-in-out'>
        <img
          src="/HeaderPage.png"
          className='max-w-xl h-auto transition-shadow hover:shadow-2xl'
          alt=""
        />
        </div>
        <h2 className='text-3xl font-bold mb-10 mt-12 text-[#ada6c1]'>
            Mint NewToken. Predict BTC's Future!
        </h2>
        {currentAccount === '' ? (
          <button className='text-2xl font-bold py-3 px-12 bg-[#e1d2a4] rounded-lg mb-10 hover:scale-105 transition-duration:100ms ease-in-out'
          onClick={connectWallet}
          >
            Connect Wallet
          </button>) : correctNetwork ? (
            <button
            className='text-2xl font-bold py-3 px-12 bg-[#e1d2a4] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
            onClick={mintNewToken}
            >
            Mint NewToken
            </button>
          ) : (
            <div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3'>
              <div>----------------------------------------</div>
              <div>Please connect to the Sepolia Testnet</div>
              <div>and reload the page</div>
              <div>----------------------------------------</div>
            </div>
          )
        }
        <div className='grid grid-cols-2 gap-2 mb-4 text-2xl font-bold justify-centre items-center'>
          <div>BTC Price (USD):</div>
          <div>$17700</div>
        </div>
        <h3 className='font-bold text-l'>
          Do you think the price of Bitcoin will exceed $18,000?
        </h3>
        <h4>
          Yes or no, place bet below!
        </h4>
        <div className='p-4 justify-center items-center flex'>
          <form className='flex'>
            <input className='bg-gray-200 shadow-inner rounded-l p-2 flex-1' id='bet' type='Bet Amount' aria-label='Bet Amount' placeholder='Enter bet amount in NewToken' />
            <input className='bg-gray-200 shadow-inner rounded-l p-2 flex-1 ml-4' id='Yes/No' type='Yes/No' aria-label='Above or below $18000' placeholder='Enter yes or no' />
            <button className='bg-blue-600 hover:bg-blue-700 duration-300 text-white shadow p-2 rounded-r' type='submit'>
              Submit!
            </button>
          </form>
        </div>
      </div>
    </>
    
  )
}
