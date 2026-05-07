import React, { useEffect, useState, useRef } from 'react';
import { getMyFiles, uploadFile } from '../../api/filesApi';
import File from '../../components/file/File';
import './Dashboard.css';

const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const loadData = async () => {
        const data = await getMyFiles();
        setFiles(data || []);
    };

    useEffect(() => { loadData(); }, []);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            await uploadFile(file);
            await loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    return (
        <div className="page-container"> {/* Schimbă numele clasei ca să nu se bată cu layout-ul */}
            <header className="page-header">
                <div className="header-info">
                    <h1>My Files</h1>
                    <p>Manage and secure your institutional documents.</p>
                </div>
                <button className="upload-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
                    {uploading ? "Uploading..." : "+ Upload File"}
                </button>
            </header>

            <div className="file-card">
                <div className="file-header-row">
                    <span>NAME</span>
                    <span>SIZE</span>
                    <span>TYPE</span>
                    <span className="text-right">ACTIONS</span>
                </div>
                <div className="file-body">
                {files.length > 0 ? (
                    files.map(file => <File key={file.id} file={file} />)
                ) : (
                    <div className="empty-state-container">
                        <div className="empty-icon">📂</div>
                        <p>No files found</p>
                        <span>Upload your first document to get started.</span>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default Dashboard;