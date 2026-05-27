import { useCallback, useEffect, useMemo, useState } from 'react';
import { downloadFile, getAccessibleFiles } from '../../api/filesApi';
import { getUsers } from '../../api/usersApi';
import FileList from '../../components/file/FileList';
import FileToolbar from '../../components/file/FileToolbar';
import { useAuth } from '../../context/AuthContext';
import '../dashboard/Dashboard.css';

const SharedPage = () => {
    const { user } = useAuth();
    const currentUserId = user?.id;
    const [files, setFiles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [busyFileId, setBusyFileId] = useState(null);

    const loadData = useCallback(async ({ silent = false } = {}) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [filesData, usersData] = await Promise.all([
                getAccessibleFiles(),
                getUsers(),
            ]);

            setFiles(Array.isArray(filesData) ? filesData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            setFiles([]);
            setFeedback({
                type: 'error',
                text: error?.response?.data?.message || 'Could not load shared files.',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            loadData();
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [loadData]);

    const usersMap = useMemo(() => {
        return users.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }, [users]);

    const canFilterOwnFiles = Boolean(currentUserId) && files.some((file) => Object.prototype.hasOwnProperty.call(file, 'ownerId'));

    const visibleFiles = useMemo(() => {
        const accessibleFiles = canFilterOwnFiles
            ? files.filter((file) => !file.ownerId || file.ownerId !== currentUserId)
            : files;

        const query = searchQuery.trim().toLowerCase();
        if (!query) return accessibleFiles;

        return accessibleFiles.filter((file) => {
            const owner = usersMap[file.ownerId];
            const ownerLabel = owner ? `${owner.name} ${owner.email}` : String(file.ownerId || '');

            return (
                String(file.name || '').toLowerCase().includes(query) ||
                String(file.type || '').toLowerCase().includes(query) ||
                String(file.id || '').toLowerCase().includes(query) ||
                ownerLabel.toLowerCase().includes(query)
            );
        });
    }, [canFilterOwnFiles, currentUserId, files, searchQuery, usersMap]);

    const getOwnerLabel = (ownerId) => {
        if (!ownerId) return '-';
        const owner = usersMap[ownerId];
        return owner ? `${owner.name} (${owner.email})` : ownerId;
    };

    const handleDownload = async (file) => {
        try {
            setBusyFileId(file.id);
            await downloadFile(file.id, file.name);
        } catch (error) {
            setFeedback({
                type: 'error',
                text: error?.response?.data?.message || 'Download failed. Check your permissions.',
            });
        } finally {
            setBusyFileId(null);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="header-info">
                    <h1>Shared Files</h1>
                    <p>Files available to you through sharing or role-based access.</p>
                </div>
            </header>

            {feedback?.text && (
                <div className={`file-feedback file-feedback-${feedback.type}`}>
                    {feedback.text}
                </div>
            )}

            <FileToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={() => loadData({ silent: true })}
                refreshing={refreshing}
            />

            <FileList
                files={visibleFiles}
                loading={loading}
                emptyTitle={searchQuery ? 'No matching files' : 'No shared files found'}
                emptyDescription={searchQuery ? 'Try a different search term.' : 'Files shared with you or granted through roles will appear here.'}
                showOwner
                getOwnerLabel={getOwnerLabel}
                onDownload={handleDownload}
                busyFileId={busyFileId}
            />
        </div>
    );
};

export default SharedPage;
