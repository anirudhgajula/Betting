import { useContractRead, useContractWrite, usePrepareContractWrite,
    useWaitForTransaction } from 'wagmi';


import Betting from '../utils/Betting.json'
import { FC, useEffect, useState } from 'react'
import { bettingContractAddress } from "../config.js"

function parseBet(data: string[]) {
    if (String(data) == "undefined") return "0";
    if (String(data[0]) == ("undefined")) {
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
    const {data} = useContractRead({
        address: bettingContractAddress,
        abi: Betting.abi,
        functionName: 'getUserBetChoice',
        watch: true,
    });

    const [bet, setBet] = useState(parseBet(data as string[]));
    const [choice, setChoice] = useState(parseChoice(data as string[]));
    var BetPlaced: boolean = bet.localeCompare("0") != 0;

    useEffect(() => {
        setBet(parseBet(data as string[]));
        setChoice(parseChoice(data as string[]));
        if (bet.localeCompare("0") != 0) {
            console.log(bet);
            BetPlaced = true;
        }
        else {
            BetPlaced = false;
        }
    }, [data])

    return (
        <>
            {BetPlaced && (
                <div className="container m-auto grid grid-cols-2">
                    <div className="tile bg-teal-800">
                        <h1 className="tile-marker text-blue-400">{bet}</h1>
                    </div>
                    <div className="tile bg-teal-800">
                        {choice.localeCompare("1") == 0 && (
                            <h1 className="tile-marker text-blue-400">Rise</h1>
                        )}
                        {choice.localeCompare("0") == 0 && (
                            <h1 className="tile-marker text-blue-400">Fall</h1>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default UserDetails;