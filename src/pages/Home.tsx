import { TypeEffect } from '@/layout/styled';

const Home = () => {
    return (
        <div className='text-center'>
            <div className='text-xl inline-block'>
                <TypeEffect>
                    Dev Tools
                </TypeEffect>
            </div>
            <div>
                {`It's all in the browser. Nothing persists.`}
            </div>
        </div>
    )
}

export default Home;