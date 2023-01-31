import { useAccount, useConnect, 
    useContract, useContractRead, 
    useContractWrite, usePrepareContractWrite, useNetwork, 
    useWaitForTransaction, useSigner, useProvider } from 'wagmi';
import useDebounce from './useDebounce'

import { ethers, Signer } from 'ethers';

import Bet from '../utils/Betting.json';
import NewToken from '../utils/NewToken.json';
import React, { useState, useEffect, FC, FormEvent } from 'react';
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

    // useEffect(() => {
    //     const process = async () => {
    //         if (signer != undefined) {
    //             try {
    //                 const tx1 = await token?.approve(bettingContractAddress, ethers.utils.parseEther(betsize));
    //                 const result = await tx1.wait();
    //                 console.log(result);
    //                 if (result) {
    //                     setVal(betsize);
    //                     setApprove(true);
    //                 }
    //             } catch(exception) {
    //                 console.log("Please ensure limit has been approved before continuing");
    //             }
    //         }
    //     };
    //     process();
    // }, [betsize]);

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
    const [approve, setApprove] = useState(false);
    const submitClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!approve) {
            const prevBetSize = betsize;
            const val: HTMLInputElement = document.getElementById("betSize") as HTMLInputElement;
            const res = String(val.value);
            if (!Number.isNaN(Number(res)) && res !="" && signer != undefined) {
                setBetSize(res);
                try {
                    const tx1 = await token?.approve(bettingContractAddress, ethers.utils.parseEther(res));
                    const result = await tx1.wait();
                    console.log(result);
                    if (result) {
                        setVal(res);
                        setApprove(true);
                    }
                } catch(exception) {
                    console.log("Please ensure limit has been approved before continuing");
                    setBetSize(prevBetSize);
                }
            };
        }
        else {
            const button: HTMLButtonElement = event.currentTarget;
            setChoice(button.name == "Exceed" ? "1" : "0");
            try {
                write?.();
                setApprove(false);
            } catch(exception) {
                console.log("Please submit bet to continue");
            }
        }
    }

    return (
        <>
            <div className='p-4 justify-center items-center flex'>
                    <input
                        className='bg-gray-200 shadow-inner rounded p-2 flex-1'
                        id='betSize'
                        type='Bet Amount'
                        aria-label='Bet Amount'
                        placeholder='Enter bet amount in NewToken'
                    />

                    <button onClick={submitClick} name="Exceed" className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded ml-4">
                        {isLoading ? `Submitting...` : approve ? `Rise!` : `Approve`}
                    </button>
                    {approve ?
                        <button onClick ={submitClick} name ="Below" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-800 rounded ml-4">
                            Fall!
                        </button> : 
                        <></>
                    }
            </div>
            <span className='ml-3 mt-2 mb-2 text-center text-lg'>
                Approved <strong>{val.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} NewTokens</strong> for the contract.<br></br> <i>If you have already approved, please wait ~10-20s for the new limit to be updated to the blockchain.</i>
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