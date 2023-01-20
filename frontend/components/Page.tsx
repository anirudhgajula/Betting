import Head from 'next/head';
import { PropsWithChildren } from 'react';

const Page: React.FC<PropsWithChildren> = ({children}) => {
    return (
        <h1 className='text-2xl pb-4'>
            {children}
        </h1>
    );
};

export default Page;