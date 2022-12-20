import { useContractWrite, usePrepareContractWrite,
         useWaitForTransaction } from 'wagmi';

import { ethers } from 'ethers'

import NewToken from '../utils/NewToken.json'
import { FC } from 'react'
import { tokenContractAddress } from "../config.js"

const MintNT: FC<{addr: `0x${string}`}> = ({addr}) => {
    // Pass in 1000 NewTokens
    const {config}  = usePrepareContractWrite({
        address: tokenContractAddress,
        abi: NewToken.abi,
        functionName: 'mint',
        args: [addr, ethers.utils.parseEther('1000').toString()]
    });
    
    const { data, write } = useContractWrite(config)
 
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })

    const mintTokens = async() => {
        await write?.();
    }

    return (
        <div className="flex flex-col">
            <button
                disabled={isLoading}
                onClick={mintTokens}
                className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
            >
                {isLoading ? 'Minting NewToken' : 'Mint NewToken!'}
            </button>
            {isSuccess && (
                <div className='content-center'>
                    Successfully minted your 1000 NewToken!
                    <div>
                        <a href={`https://etherscan.io/tx/${data?.hash}`}>Etherscan</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MintNT;