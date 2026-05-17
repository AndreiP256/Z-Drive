import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import logo from '../../assets/logo.png'
import logout_logo from '../../assets/logout.png'
import './Header.css';
import {getProfilePictureUrl} from '../../api/filesApi.jsx';

const Header = () => {
    const { logout } = useAuth();
    const [profileUrl, setProfileUrl] = useState(null);

    useEffect(() => {
        const fetchProfileUrl = async () => {
            const url = await getProfilePictureUrl();
            setProfileUrl(url);
        };
        fetchProfileUrl();
    }, []);

    return (
        <header className="admin-header">
            <div className="admin-header_brand">
                <div className="logo-container-image">
                    <img src={logo} alt="Z-Drive Logo" className="logo-icon-header" />
                </div>
                <h2 className="admin-header_title">Z-Drive Enterprise</h2>
                <input
                    type="text"
                    placeholder="Search enterprise..."
                    className="admin-header_search"
                />
            </div>

            <div className="admin-header_actions">
                <button className="admin-header_icon-button" type="button" onClick={logout}>
                    <img src={logout_logo} alt="Logout" className="admin-header_icon" />
                </button>
                <button className="admin-header_icon-button" type="button" onClick={() => window.location.href = '/profile'}>
                    <img src={profileUrl} alt="Profile" className="admin-header_profile-icon" />
                </button>
            </div>
        </header>
    );
};

export default Header;