import { Loader2 } from 'lucide-react';
import File from './File';

const FileList = ({
    files,
    loading,
    emptyTitle,
    emptyDescription,
    showOwner = false,
    getOwnerLabel,
    onDownload,
    onShare,
    onDelete,
    busyFileId,
}) => {
    return (
        <div className="file-card">
            <div className={`file-header-row ${showOwner ? 'file-header-row--with-owner' : ''}`}>
                <span>NAME</span>
                {showOwner && <span>OWNER</span>}
                <span>SIZE</span>
                <span>TYPE</span>
                <span className="text-right">ACTIONS</span>
            </div>

            <div className="file-body">
                {loading ? (
                    <div className="empty-state-container">
                        <Loader2 className="file-loading-icon" size={34} />
                        <p>Loading files...</p>
                    </div>
                ) : files.length > 0 ? (
                    files.map((file) => (
                        <File
                            key={file.id}
                            file={file}
                            showOwner={showOwner}
                            ownerLabel={getOwnerLabel ? getOwnerLabel(file.ownerId) : '-'}
                            onDownload={onDownload}
                            onShare={onShare}
                            onDelete={onDelete}
                            busy={busyFileId === file.id}
                        />
                    ))
                ) : (
                    <div className="empty-state-container">
                        <div className="empty-icon">📂</div>
                        <p>{emptyTitle}</p>
                        {emptyDescription && <span>{emptyDescription}</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileList;
