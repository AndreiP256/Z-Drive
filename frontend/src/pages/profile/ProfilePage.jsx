import { useEffect, useMemo, useRef, useState } from 'react';
import { getProfilePictureUrl, uploadProfilePicture } from '../../api/filesApi.jsx';
import { changePassword } from '../../api/usersApi.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [pictureError, setPictureError] = useState(false);
    const fileInputRef = useRef(null);

    const displayName = useMemo(() => {
        if (!user) {
            return 'User';
        }

        return user.name || user.fullName || user.username || user.email || 'User';
    }, [user]);

    const displayEmail = useMemo(() => user?.email || 'No email available', [user]);

    useEffect(() => {
        let isMounted = true;
        let objectUrl = '';

        const loadProfilePicture = async () => {
            try {
                objectUrl = await getProfilePictureUrl();
                if (isMounted) {
                    setProfilePictureUrl(objectUrl);
                    setPictureError(false);
                }
            } catch {
                if (isMounted) {
                    setProfilePictureUrl('');
                    setPictureError(true);
                }
            }
        };

        loadProfilePicture();

        return () => {
            isMounted = false;
            if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl);
            }
        };
    }, []);

    const uploadPicture = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setUploading(true);
        try {
            await uploadProfilePicture(file);

            if (profilePictureUrl) {
                window.URL.revokeObjectURL(profilePictureUrl);
            }

            const nextPictureUrl = await getProfilePictureUrl();
            setProfilePictureUrl(nextPictureUrl);
            setPictureError(false);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to upload profile picture.');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleChangePassword = async () => {
        const newPassword = prompt('Enter your new password:');
        if (!newPassword) {
            return;
        }

        try {
            await changePassword(newPassword);
            alert('Password changed successfully.');
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Failed to change password.');
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-simple-card">
                <button
                    className="profile-photo-button"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label="Upload profile picture"
                >
                    {profilePictureUrl && !pictureError ? (
                        <img src={profilePictureUrl} alt="Profile" className="profile-photo-image" />
                    ) : (
                        <span className="profile-photo-placeholder">{displayName.charAt(0).toUpperCase()}</span>
                    )}
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={uploadPicture}
                    accept="image/*"
                    hidden
                />

                <p className="profile-photo-hint">{uploading ? 'Uploading...' : 'Click photo to change'}</p>

                <h1 className="profile-name">{displayName}</h1>
                <p className="profile-email">{displayEmail}</p>

                <button className="profile-change-password-btn" type="button" onClick={handleChangePassword}>
                    Change Password
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;