import { Download, FileText, Folder, Share2, Trash2 } from 'lucide-react';
import './File.css';

const formatFileSize = (size) => {
    if (!size || Number(size) === 0) return '0 B';
    if (size >= 1024 * 1024 * 1024) return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    if (size >= 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${Math.round(size)} B`;
};

const File = ({
    file,
    showOwner = false,
    ownerLabel = '-',
    onDownload,
    onShare,
    onDelete,
    busy = false,
}) => {
    const isFolder = Boolean(file.isFolder);

    return (
        <div className={`file-row ${showOwner ? 'file-row--with-owner' : ''}`}>
            <div className="file-info">
                <span className="file-icon-wrapper">
                    {isFolder ? <Folder size={20} /> : <FileText size={20} />}
                </span>
                <span className="file-name-text">{file.name}</span>
            </div>
            {showOwner && <div className="file-owner">{ownerLabel}</div>}
            <div className="file-size">{isFolder ? '--' : formatFileSize(file.size)}</div>
            <div className="file-type">{file.type || 'Unknown'}</div>
            <div className="file-actions">
                {!isFolder && onDownload && (
                    <button
                        className="file-action-btn"
                        onClick={() => onDownload(file)}
                        title="Download"
                        type="button"
                        disabled={busy}
                    >
                        <Download size={18} />
                    </button>
                )}
                {onShare && (
                    <button
                        className="file-action-btn"
                        onClick={() => onShare(file)}
                        title="Share"
                        type="button"
                        disabled={busy}
                    >
                        <Share2 size={18} />
                    </button>
                )}
                {onDelete && (
                    <button
                        className="file-action-btn file-action-btn-danger"
                        onClick={() => onDelete(file)}
                        title="Delete"
                        type="button"
                        disabled={busy}
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default File;
