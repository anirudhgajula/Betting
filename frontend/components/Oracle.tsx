import { FC, useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import {oracleContractAddress} from "../config.js";
import PriceBTC from '../utils/PriceBTC.json';

const Oracle: FC<{}> = ({}) => {
    const {data} = useContractRead({
        address: oracleContractAddress,
        abi: PriceBTC.abi,
        functionName: 'getLatestPrice',
        watch: true,
    });
    const [val, setVal] = useState(String(convert(data as string)));

    function convert(data: string) {
        if (String(data) == "undefined") return 0;
        return BigInt(data) / BigInt(10 ** 8);
    }

    useEffect(() => {
        if (typeof data === 'string') {
            setVal(String(data) == "undefined" ? "0" : String(convert(data)));
        }
    }, [data]);

    return (
        <div className='flex items-center justify-center place-items-center mt-2 mb-4 gap-3 w-full'>
            <span className='text-2xl align-middle font-bold'>
                BTC Price
            </span>
            <span className='text-2xl align-middle font-medium'>
                US${val.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
        </div>
    );
};

export default Oracle;