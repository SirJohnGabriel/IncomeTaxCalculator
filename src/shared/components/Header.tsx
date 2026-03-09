import { Link } from 'react-router-dom';

export function Header() {
    return (
        <header style={{
            color: '#fff',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
            className="bg-background"
        >
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.01em' }}>
                    <span className='text-primary'> Income </span> Tax Calculator
                </span>
            </Link>

            {/* <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                <Link to="/" style={{ color: '#a0aec0', textDecoration: 'none' }}>
                    Calculator
                </Link>
            </nav> */}
        </header>
    );
}
