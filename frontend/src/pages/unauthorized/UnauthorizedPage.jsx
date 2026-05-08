import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-viewport">
            <div className="unauthorized-content">
                <p className="unauthorized-code">403</p>
                <h1 className="unauthorized-title">Access Denied</h1>
                <p className="unauthorized-text">
                    Sorry, you don’t have permission to access this page.
                </p>
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    Go back home
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;