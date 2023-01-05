import { FC, useState } from "react";
import {oracleContractAddress} from "../config.js";

interface props { }

const Oracle: FC<{}> = ({}) => {
    const [val, setVal] = useState('16600');

    return (
        <div className='flex items-center justify-center place-items-center mt-2 mb-4 gap-3 w-full'>
            <span className='text-2xl align-middle font-bold'>
                BTC Price
            </span>
            <span className='text-2xl align-middle font-medium'>
                US${val}
            </span>
        </div>
    );
};

export default Oracle;