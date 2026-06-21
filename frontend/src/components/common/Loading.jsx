import React from 'react';
import { RingLoader } from 'react-spinners';

const Loading = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <RingLoader color={'#1A56DB'} size={80} />
        </div>
    );
};

export default Loading;