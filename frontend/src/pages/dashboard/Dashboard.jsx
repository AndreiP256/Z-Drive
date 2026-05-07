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
            alert("Upload failed! Check file size or connection.");
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="header-text">
                        <h1>My Files</h1>
                        <p>Manage and secure your institutional documents.</p>
                    </div>
                    <div className="header-actions">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                        <button className="upload-main-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                            {uploading ? "Uploading..." : "+ Upload File"}
                        </button>
                    </div>
                </header>

                <div className="file-list-card">
                    <div className="file-table-header">
                        <span>NAME</span>
                        <span>SIZE</span>
                        <span>TYPE</span>
                        <span className="text-right">ACTIONS</span>
                    </div>
                    <div className="file-rows-container">
                        {files.length > 0 ? (
                            files.map(file => <File key={file.id} file={file} />)
                        ) : (
                            <div className="empty-state">No files uploaded yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;