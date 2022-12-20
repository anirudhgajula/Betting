import { useContractWrite, usePrepareContractWrite,
         useWaitForTransaction } from 'wagmi';

import { ethers } from 'ethers'

import NewToken from '../utils/NewToken.json'
import { FC } from 'react'
import { tokenContractAddress } from "../config.js"

const MintNT: FC<{addr: `0x${string}` | undefined}> = ({addr}) => {
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
                <span className='mt-3 text-center'>
                    <strong> Successfully minted your 1000 NewToken! </strong>
                    <br></br>
                    <a className="underline text-blue-900 hover:text-blue-800 visited:text-purple-800" href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
                        <i> Link to Etherscan </i>
                    </a>
                </span>
            )}
        </div>
    );
};

export default MintNT;