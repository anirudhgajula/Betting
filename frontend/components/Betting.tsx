import { useAccount, useConnect, 
    useContract, useContractRead, 
    useContractWrite, usePrepareContractWrite, useNetwork, 
    useWaitForTransaction, useSigner, useProvider } from 'wagmi';
import useDebounce from './useDebounce'

import { ethers, Signer } from 'ethers';

import Bet from '../utils/Betting.json';
import NewToken from '../utils/NewToken.json';
import { useState, useEffect, FC, FormEvent } from 'react';
import {bettingContractAddress, tokenContractAddress} from "../config.js";
import { time } from 'console';

var options: {[name: string]: string} = {"yes": "1", "Yes": "1", "No": "0", "no": "0"};


const Betting = () => {
    const [choice, setChoice] = useState("1");
    const [betsize, setBetSize] = useState("0");
    const debounceBetSize = useDebounce(betsize, 500);
    const [val, setVal] = useState("0");

    const [signer, setSigner] = useState<Signer>();
    const account = useAccount({
        onConnect({ address, connector, isReconnected }) {
          console.log('Connected', { address, connector, isReconnected })
        },
    })

    useEffect(() => {
      (async () => {
        try {
          const res = await account?.connector?.getSigner();
          setSigner(res);
        } catch (e) {
          setSigner(undefined);
        }
      })();
    }, [account]);

    const token = useContract({
        address: tokenContractAddress,
        abi: NewToken.abi,
        signerOrProvider: signer
    });

    useEffect(() => {
        const timer = setTimeout(async() => {
            if (signer != undefined) {
                try {
                    const tx1 = await token?.approve(bettingContractAddress, ethers.utils.parseEther(debounceBetSize));
                    const result = await tx1.wait();
                    console.log(result);
                    if (result) {
                        setVal(debounceBetSize);
                    }
                } catch(exception) {
                    console.log("Please ensure limit has been approved before continuing");
                }
            }
        })
        return () => {
            clearTimeout(timer);
        }
    }, [debounceBetSize]);

    // Pass in 1000 NewTokens
    const {config}  = usePrepareContractWrite({
        address: bettingContractAddress,
        abi: Bet.abi,
        functionName: 'addFunds',
        args: [ethers.utils.parseEther(val).toString(), choice],
        enabled: Boolean(val),
    });

    const { data, write } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    const handleSubmit = (event:React.FormEvent<HTMLFormElement>) => {
        // To prevent refreshing of the form and to ensure we stay on the same page
        event.preventDefault();
        try {
            write?.();
        } catch(exception) {
            console.log("Please approve bet to continue");
        }
    };

    return (
        <>
            <h4>
            Yes or no, place bet below!
            </h4>
            <div className='p-4 justify-center items-center flex'>
                <form className='flex' onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}>
                    <input
                        onChange={(e) => 
                                    {
                                        // to check if its a number and that it is not empty
                                        if (!Number.isNaN(Number(e.target.value)) && e.target.value !="") {
                                            setBetSize(e.target.value);
                                        };
                                    }
                                }
                        className='bg-gray-200 shadow-inner rounded p-2 flex-1'
                        id='betSize'
                        type='Bet Amount'
                        aria-label='Bet Amount'
                        placeholder='Enter bet amount in NewToken'
                    />
                    <input
                        onChange={(e) => 
                                    {
                                        if (e.target.value in options) {
                                            setChoice(options[e.target.value])
                                        }
                                    }
                                }
                        className='bg-gray-200 shadow-inner rounded-l p-2 flex-1 ml-4' id='choice' type='Yes/No' aria-label='Above or below $18000' placeholder='Enter yes or no'
                    />
                    <button
                        className='bg-blue-600 hover:bg-blue-700 duration-300 text-white shadow p-2 rounded-r' type='submit'
                    >
                    {isLoading ? 'Submitting...' : 'Submit!'}
                    </button>
                    
                </form>
            </div>
            <span className='ml-3 mt-2 mb-2 text-center'>
                You have approved a limit of <strong>{val.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} NewTokens</strong> for the contract.<br></br> If you have already approved it, please wait ~10-20s for the new limit to be updated to the blockchain.
            </span>
            <br></br>
            {isSuccess && (
                        <span className='ml-3 mt-2 mb-2 text-center'>
                            <strong> Successfully placed your bet! </strong>
                            <br></br>
                            <a className="underline text-blue-900 hover:text-blue-800 visited:text-purple-800" href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
                                <i> Link to Etherscan </i>
                            </a>
                        </span>
            )}
        </>
        
    );
};

export default Betting;