import { ReactNode, FC, useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import {bettingContractAddress} from "../config.js";
import Betting from '../utils/Betting.json';
import {oracleContractAddress} from "../config.js";
import PriceBTC from '../utils/PriceBTC.json';

// type HeaderProps = {
//     children: ReactNode;
// };

// function h3(props: HeaderProps) {
//     return <div>{props.children}</div>;
// };
  

const PredictVal: FC<{}> = ({}) => {
    function convertInitial(data: string) {
        if (String(data) == "undefined") return 0;
        return (Number(BigInt(data) / BigInt(10 ** 11)) + 1) * 10 ** 3;
    }

    function parserToken(data: string) {
        if (String(data) == "undefined") return 0;
        return BigInt(data) / BigInt(10 ** 18);
    }

    const {data} = useContractRead({
        address: bettingContractAddress,
        abi: Betting.abi,
        functionName: 'getBetPrice',
        watch: true,
    });

    const {data: initial} = useContractRead({
        address: oracleContractAddress,
        abi: PriceBTC.abi,
        functionName: 'getLatestPrice',
        watch: true,
    });

    const {data: num} = useContractRead({
        address: bettingContractAddress,
        abi: Betting.abi,
        functionName: 'getNumPlayers',
        watch: true,
    });
    
    const {data: size} = useContractRead({
        address: bettingContractAddress,
        abi: Betting.abi,
        functionName: 'getTotalFunds',
        watch: true,
    });

    const [val, setVal] = useState(String(convertInitial(initial as string)));

    useEffect(() => {
        if (typeof data === 'string') {
            setVal(String(data) == "undefined" ? "0" : String(data));
        }
    }, [data]);
    
    const [num2, setNum2] = useState(String(num) == "undefined" ? "0" : String(num));
    useEffect(() => {
        if (typeof num === 'string') {
            setNum2(String(num) == "undefined" ? "0" : String(num));
        }
    }, [num]);

    const [size2, setSize2] = useState(String(size) == "undefined" ? "0" : String(parserToken(size as string)));
    useEffect(() => {
        if (typeof size === 'string') {
            setSize2(String(size) == "undefined" ? "0" : String(size));
        }
    }, [size]);

    return (
        <>
            <h3 className='font-bold text-xl'>
                Do you think the price of Bitcoin will exceed ${val} by Sunday?
            </h3>
            <br></br>
            <h3 className='font-semibold text-l'>
                {num2 == "1" ? `There is ${num2} player who has bet ${size2} NewTokens.` : `There are ${num2} players who have bet ${size2} NewTokens`}
            </h3>
        </>
        
    );
};

export default PredictVal;