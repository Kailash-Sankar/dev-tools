import { TypeEffect } from '@/assets/styled';

const Home = () => {
    return (
        <div className='text-center'>
            <div className='inline-block'>
            <TypeEffect>
                <span className="key">D</span>
                <span className="key">E</span>
                <span className="key">V</span>
                <span className="key">&nbsp;</span>
                <span className="key">T</span>
                <span className="key">O</span>
                <span className="key">O</span>
                <span className="key">L</span>
                <span className="key">S</span>
                </TypeEffect>
            </div>

            <div style={{ 
                backgroundColor: `hsl(var(--border))`,
                display: 'inline-block',
                padding: 2
             }}>
                {`There are no API calls. Data stays in the browser, persists only on browser localStorage.`}
            </div>
        </div>
    )
}

export default Home;