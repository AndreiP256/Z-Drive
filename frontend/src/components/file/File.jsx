import React from 'react';
import { downloadFile } from '../../api/filesApi';
import './File.css';

const File = ({ file }) => {
    const handleDownload = async (e) => {
        e.preventDefault();
        try {
            // Trimitem ID-ul și numele pentru a salva fișierul corect
            await downloadFile(file.id, file.name);
        } catch (error) {
            console.error("Download failed", error);
            alert("Could not download file.");
        }
    };

    const formatFileSize = (sizeInKb) => {
        if (!sizeInKb || sizeInKb === 0) return '0 KB';
        
        if (sizeInKb >= 1024 * 1024) {
            return (sizeInKb / (1024 * 1024)).toFixed(2) + ' GB';
        } else if (sizeInKb >= 1024) {
            return (sizeInKb / 1024).toFixed(2) + ' MB';
        } else {
            return Math.round(sizeInKb) + ' KB';
        }
    };

    return (
        <div className="file-row">
            <div className="file-info">
                <span className="file-icon-wrapper">
                    {file.isFolder ? '📁' : '📄'}
                </span>
                <span className="file-name-text">{file.name}</span>
            </div>
            <div className="file-size">{file.isFolder ? '--' : formatFileSize(file.size)}</div>
            <div className="file-type">{file.type || 'Unknown'}</div>
            <div className="file-actions">
                {!file.isFolder && (
                    <button className="action-btn download" onClick={handleDownload} title="Download">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default File;