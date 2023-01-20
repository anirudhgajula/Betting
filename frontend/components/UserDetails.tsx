import { goerli, useAccount, useContractRead, useContractWrite, usePrepareContractWrite,
    useWaitForTransaction, useSigner } from 'wagmi';


import Betting from '../utils/Betting.json'
import { FC, useEffect, useState } from 'react'
import { bettingContractAddress } from "../config.js"

function parseBet(data: string[]) {
    if (String(data) == "undefined") return "0";
    if (String(data[0]) === "undefined") {
        return "0";
    }
    return String(BigInt(data[0]) / BigInt(10 ** 18));
}

function parseChoice(data: string[]) {
    if (String(data) == "undefined") return "0";
    if (String(data[1]) == "undefined") {
        return "No Bet";
    }
    return String(data[1]);
}

const UserDetails: FC<{}> = ({}) => {    
    const {address} = useAccount();
    const {data} = useContractRead({
        address: bettingContractAddress,
        abi: Betting.abi,
        functionName: 'getUserBetChoice',
        watch: true,
        overrides: { from: address },
    });

    const [bet, setBet] = useState(parseBet(data as string[]));
    const [choice, setChoice] = useState(parseChoice(data as string[]));
    var BetPlaced: boolean = bet !== "0";

    useEffect(() => {
        setBet(parseBet(data as string[]));
        setChoice(parseChoice(data as string[]));
        if (bet !== "0") {
            console.log(bet);
            BetPlaced = true;
        }
        else {
            BetPlaced = false;
        }
    }, [data]);

    return (
        <>
            {BetPlaced && (
                <div className="flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 p-5">
                        <div className="text-lg text-center p-10 bg-green-600 rounded-lg">
                            <h1 className="tile-marker text-blue-800 text-center">Successfully placed a bet of <strong>{bet} NewTokens!</strong></h1>
                        </div>
                        <div className="text-lg text-center p-10 bg-green-600 rounded-lg">
                            {choice == "1" && (
                                <h1 className=" text-blue-800 text-center">You expect the BTC/USD price to <strong>Rise!</strong></h1>
                            )}
                            {choice == "0" && (
                                <h1 className=" text-blue-900 test-center">You expect the BTC/USD price to <strong>Fall!</strong></h1>
                            )}
                        </div>
                    </div>
                    
                </div>
            )}
        </>
    );
};

export default UserDetails;