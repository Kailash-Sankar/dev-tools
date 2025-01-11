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
                {`There are no API calls. Data stays in the browser, persists only on browser localStorage.`}
            </div>
        </div>
    )
}

export default Home;