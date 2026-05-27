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
    const [passwordFormOpen, setPasswordFormOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
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
            window.location.reload();
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to upload profile picture.');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const openPasswordForm = () => {
        setPasswordFormOpen(true);
        setPasswordError('');
        setPasswordSuccess('');
    };

    const closePasswordForm = () => {
        setPasswordFormOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();

        const trimmedPassword = newPassword.trim();
        const trimmedConfirmation = confirmPassword.trim();

        if (trimmedPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
            return;
        }

        if (trimmedPassword !== trimmedConfirmation) {
            setPasswordError('Passwords do not match.');
            return;
        }

        setChangingPassword(true);
        setPasswordError('');
        setPasswordSuccess('');

        try {
            await changePassword(trimmedPassword);
            setPasswordSuccess('Password changed successfully.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError('Failed to change password. Please try again.');
        } finally {
            setChangingPassword(false);
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

                {!passwordFormOpen ? (
                    <button className="profile-change-password-btn" type="button" onClick={openPasswordForm}>
                        Change Password
                    </button>
                ) : (
                    <form className="profile-password-panel" onSubmit={handleChangePassword}>
                        <div className="profile-form-group">
                            <label className="profile-form-label" htmlFor="newPassword">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                className="profile-form-input"
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="profile-form-group">
                            <label className="profile-form-label" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                className="profile-form-input"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Repeat new password"
                                autoComplete="new-password"
                            />
                        </div>

                        {passwordError && <p className="profile-form-message profile-form-message--error">{passwordError}</p>}
                        {passwordSuccess && <p className="profile-form-message profile-form-message--success">{passwordSuccess}</p>}

                        <div className="profile-form-actions">
                            <button className="profile-change-password-btn" type="submit" disabled={changingPassword}>
                                {changingPassword ? 'Saving...' : 'Save Password'}
                            </button>
                            <button className="profile-secondary-btn" type="button" onClick={closePasswordForm} disabled={changingPassword}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;