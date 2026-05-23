import { useMemo, useState } from 'react';
import { Copy, Link, Share2, X } from 'lucide-react';
import { getShareLink, revokeShare, shareFile } from '../../api/sharingApi';
import './ShareFileModal.css';

const ACCESS_LEVELS = [
    { value: 'VIEWER', label: 'Viewer', description: 'READ' },
    { value: 'EDITOR', label: 'Editor', description: 'READ + UPDATE' },
];

const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === 'string') return data;
    return data?.message || fallback;
};

const ShareFileModal = ({ file, users, currentUserId, onClose, onShareChanged }) => {
    const [targetUserId, setTargetUserId] = useState('');
    const [accessLevel, setAccessLevel] = useState('VIEWER');
    const [shareLinkValue, setShareLinkValue] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);

    const selectableUsers = useMemo(() => {
        return (Array.isArray(users) ? users : []).filter((user) => user.id !== currentUserId);
    }, [currentUserId, users]);

    const selectedUser = selectableUsers.find((user) => user.id === targetUserId);

    const setMessage = (type, text) => {
        setFeedback({ type, text });
    };

    const validateTargetUser = () => {
        if (!targetUserId) {
            setMessage('error', 'Select a user first.');
            return false;
        }

        return true;
    };

    const handleShare = async () => {
        if (!validateTargetUser()) return;

        try {
            setLoadingAction('share');
            setFeedback(null);

            const response = await shareFile({
                fileId: file.id,
                targetUserId,
                accessLevel,
            });

            setShareLinkValue(response.link || '');
            setMessage('success', `Shared with ${selectedUser?.email || 'selected user'}.`);
            onShareChanged?.();
        } catch (error) {
            setMessage('error', getErrorMessage(error, 'Failed to share this file.'));
        } finally {
            setLoadingAction(null);
        }
    };

    const handleGetLink = async () => {
        if (!validateTargetUser()) return;

        try {
            setLoadingAction('link');
            setFeedback(null);

            const response = await getShareLink(file.id, targetUserId);
            setShareLinkValue(response.link || '');
            setMessage('success', 'Share link loaded.');
        } catch (error) {
            setShareLinkValue('');
            setMessage('error', getErrorMessage(error, 'No share link found for this user.'));
        } finally {
            setLoadingAction(null);
        }
    };

    const handleRevoke = async () => {
        if (!validateTargetUser()) return;

        try {
            setLoadingAction('revoke');
            setFeedback(null);

            await revokeShare({
                fileId: file.id,
                targetUserId,
            });

            setShareLinkValue('');
            setMessage('success', `Access revoked for ${selectedUser?.email || 'selected user'}.`);
            onShareChanged?.();
        } catch (error) {
            setMessage('error', getErrorMessage(error, 'Failed to revoke access for this user.'));
        } finally {
            setLoadingAction(null);
        }
    };

    const handleCopy = async () => {
        if (!shareLinkValue) return;

        try {
            await navigator.clipboard.writeText(shareLinkValue);
            setMessage('success', 'Link copied.');
        } catch {
            setMessage('error', 'Could not copy the link.');
        }
    };

    return (
        <div className="share-modal-overlay">
            <div className="share-modal">
                <div className="share-modal-header">
                    <div>
                        <h2>Share File</h2>
                        <p>{file.name}</p>
                    </div>
                    <button className="share-modal-close" onClick={onClose} type="button" title="Close">
                        <X size={20} />
                    </button>
                </div>

                {feedback?.text && (
                    <div className={`share-feedback share-feedback-${feedback.type}`}>
                        {feedback.text}
                    </div>
                )}

                <div className="share-form-group">
                    <label>User</label>
                    <select
                        value={targetUserId}
                        onChange={(event) => {
                            setTargetUserId(event.target.value);
                            setShareLinkValue('');
                            setFeedback(null);
                        }}
                    >
                        <option value="">Select user</option>
                        {selectableUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="share-form-group">
                    <label>Access</label>
                    <div className="access-level-list">
                        {ACCESS_LEVELS.map((option) => (
                            <button
                                key={option.value}
                                className={`access-level-option ${accessLevel === option.value ? 'access-level-option-active' : ''}`}
                                onClick={() => setAccessLevel(option.value)}
                                type="button"
                            >
                                <span>{option.label}</span>
                                <small>{option.description}</small>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="share-limit-note">
                    Existing recipients are not exposed by the API. Select a user manually to load a link or revoke access.
                </div>

                {shareLinkValue && (
                    <div className="share-link-box">
                        <Link size={18} />
                        <span title={shareLinkValue}>{shareLinkValue}</span>
                        <button onClick={handleCopy} type="button" title="Copy link">
                            <Copy size={17} />
                        </button>
                    </div>
                )}

                <div className="share-modal-actions">
                    <button
                        className="secondary-file-btn"
                        onClick={handleGetLink}
                        disabled={Boolean(loadingAction)}
                        type="button"
                    >
                        {loadingAction === 'link' ? 'Loading...' : 'Get Link'}
                    </button>
                    <button
                        className="danger-file-btn"
                        onClick={handleRevoke}
                        disabled={Boolean(loadingAction)}
                        type="button"
                    >
                        {loadingAction === 'revoke' ? 'Revoking...' : 'Revoke'}
                    </button>
                    <button
                        className="primary-file-btn"
                        onClick={handleShare}
                        disabled={Boolean(loadingAction) || selectableUsers.length === 0}
                        type="button"
                    >
                        <Share2 size={18} />
                        {loadingAction === 'share' ? 'Sharing...' : 'Share'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareFileModal;
