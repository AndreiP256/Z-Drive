import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deleteFile, downloadFile, getMyFiles, uploadFile } from '../../api/filesApi';
import { getUsers } from '../../api/usersApi';
import FileList from '../../components/file/FileList';
import FileToolbar from '../../components/file/FileToolbar';
import ShareFileModal from '../../components/file/ShareFileModal';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [selectedShareFile, setSelectedShareFile] = useState(null);
    const [busyFileId, setBusyFileId] = useState(null);
    const fileInputRef = useRef(null);

    const loadData = useCallback(async ({ silent = false } = {}) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [filesData, usersData] = await Promise.all([
                getMyFiles(),
                getUsers(),
            ]);

            setFiles(Array.isArray(filesData) ? filesData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            setFiles([]);
            setFeedback({
                type: 'error',
                text: error?.response?.data?.message || 'Could not load your files.',
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

    const filteredFiles = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return files;

        return files.filter((file) => {
            return (
                String(file.name || '').toLowerCase().includes(query) ||
                String(file.type || '').toLowerCase().includes(query) ||
                String(file.id || '').toLowerCase().includes(query)
            );
        });
    }, [files, searchQuery]);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setFeedback(null);

        try {
            await uploadFile(file);
            setFeedback({
                type: 'success',
                text: `"${file.name}" uploaded successfully.`,
            });
            await loadData({ silent: true });
        } catch (error) {
            setFeedback({
                type: 'error',
                text: error?.response?.data?.message || 'Upload failed.',
            });
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    const handleDownload = async (file) => {
        try {
            setBusyFileId(file.id);
            await downloadFile(file.id, file.name);
        } catch (error) {
            setFeedback({
                type: 'error',
                text: error?.response?.data?.message || 'Download failed.',
            });
        } finally {
            setBusyFileId(null);
        }
    };

    const handleDelete = async (file) => {
        const confirmed = window.confirm(`Delete "${file.name}"?`);
        if (!confirmed) return;

        try {
            setBusyFileId(file.id);
            setFeedback(null);
            await deleteFile(file.id);
            setFiles((prev) => prev.filter((item) => item.id !== file.id));
            setFeedback({
                type: 'success',
                text: `"${file.name}" deleted successfully.`,
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                text: error?.response?.data?.message || 'Delete failed. Check your permissions.',
            });
        } finally {
            setBusyFileId(null);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="header-info">
                    <h1>My Files</h1>
                    <p>Manage and secure your institutional documents.</p>
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
                showUpload
                uploading={uploading}
                onUploadClick={() => fileInputRef.current?.click()}
                onRefresh={() => loadData({ silent: true })}
                refreshing={refreshing}
            />

            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />

            <FileList
                files={filteredFiles}
                loading={loading}
                emptyTitle={searchQuery ? 'No matching files' : 'No files found'}
                emptyDescription={searchQuery ? 'Try a different search term.' : 'Upload your first document to get started.'}
                onDownload={handleDownload}
                onShare={setSelectedShareFile}
                onDelete={handleDelete}
                busyFileId={busyFileId}
            />

            {selectedShareFile && (
                <ShareFileModal
                    file={selectedShareFile}
                    users={users}
                    currentUserId={user?.id}
                    onClose={() => setSelectedShareFile(null)}
                    onShareChanged={() => loadData({ silent: true })}
                />
            )}
        </div>
    );
};

export default Dashboard;
