import { FC, useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import {bettingContractAddress} from "../config.js";
import Betting from '../utils/Betting.json';

function parserToken(data: string) {
    if (String(data) == "undefined") return 0;
    return BigInt(data) / BigInt(10 ** 18);
}

const PredictVal: FC<{}> = ({}) => {
    const {data} = useContractRead({
        address: bettingContractAddress,
        abi: Betting.abi,
        functionName: 'getBetPrice',
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
    const [lowThresh, setLowThresh] = useState(String(data) == "undefined" ? "0" : String((data as String[])[0]));
    const [upThresh, setUpThresh] = useState(String(data) == "undefined" ? "0" : String((data as String[])[1]));


    useEffect(() => {
        setLowThresh(String(data) == "undefined" ? "0" : String((data as String[])[0]));
        setUpThresh(String(data) == "undefined" ? "0" : String((data as String[])[1]));

    }, [data]);
    
    const [num2, setNum2] = useState(String(num) == "undefined" ? "0" : String(num));
    useEffect(() => {
        setNum2(String(num) == "undefined" ? "0" : String(num));
    }, [num]);

    const [size2, setSize2] = useState(String(size) == "undefined" ? "0" : String(parserToken(size as string)));
    useEffect(() => {
        setSize2(String(size) == "undefined" ? "0" : String(parserToken(size as string)));
    }, [size]);

    return (
        <>
            <div className="grid grid-cols-2 gap-4 p-5">
                <div className="bg-blue-400 text-green-100 text-2xl font-bold text-center p-7 rounded-lg hover:scale-105">{num2 == "1" ? `${num2} Player` : `${num2} Players`}</div>
                <div className="bg-blue-400 text-green-100 text-2xl font-bold text-center p-7 rounded-lg hover:scale-105">{`${size2} NT`}</div>
            </div>
            <br></br>
            <div className="grid grid-cols-2 gap-4 p-5">
                <div className="bg-blue-600 text-blue-100 text-lg font-semibold text-center p-7 rounded-lg">
                    Rise: You expect price to be higher than ${upThresh.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className="bg-red-700 text-red-100 text-lg font-semibold text-center p-7 rounded-lg">
                    Fall: You expect price to be lower than ${lowThresh.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
            </div>
            <br></br>
            <h4 className="text-xl font-bold">
                Rise or fall, approve and bet below!
            </h4>
        </>
        
    );
};

export default PredictVal;