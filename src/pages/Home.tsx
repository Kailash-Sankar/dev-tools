import { TypeEffect } from '@/layout/styled';
import React from 'react';

const Home = () => {
    return (
        <div className='text-center'>
            <div className='text-xl inline-block'>
                <TypeEffect>
                    Dev Tools
                </TypeEffect>
            </div>
            <div>
                {`<- Tools are listed on the left side bar`}
            </div>
        </div>
    )
}

export default Home;