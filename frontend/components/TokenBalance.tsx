import { useBalance, useContractWrite, usePrepareContractWrite,
    useWaitForTransaction } from 'wagmi';

import { BigNumber, ethers } from 'ethers'

import NewToken from '../utils/NewToken.json'
import { FC, useEffect, useState } from 'react'
import { tokenContractAddress } from "../config.js"

const TokenBalance: FC<{addr: `0x${string}` | undefined}> = ({addr}) => {
    const {data} = useBalance({
        address: addr,
        token: tokenContractAddress,
        watch: true
    });
    // Hooks are used to prevent hydration error
    const [val, setVal] = useState('0');
    // useEffect Hook, if data changes it runs again.
    useEffect(() => {
        setVal(String(data?.formatted) == "undefined" ? "0" : String(ethers.utils.formatEther(data?.value as BigNumber)).split(".")[0]);
    }, [data]);

    return (
        <div className='flex items-center justify-center place-items-center mt-2 mb-4 gap-3 w-full'>
            <span className='text-2xl align-middle font-bold'>
                User Balance
            </span>
            <span className='text-2xl align-middle font-medium'>
                {val.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} NT
            </span>
        </div>
    );
};

export default TokenBalance;