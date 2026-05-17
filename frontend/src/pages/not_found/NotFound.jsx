import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="notfound-viewport">
            <div className="notfound-content">
                <p className="notfound-code">404</p>
                <h1 className="notfound-title">Page not found</h1>
                <p className="notfound-text">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                </p>
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    Go back home
                </button>
            </div>
        </div>
    );
};

export default NotFound;