import { RefreshCw, Search, Upload } from 'lucide-react';

const FileToolbar = ({
    searchQuery,
    onSearchChange,
    onUploadClick,
    uploading = false,
    showUpload = false,
    onRefresh,
    refreshing = false,
}) => {
    return (
        <div className="files-page-toolbar">
            <label className="files-search-box">
                <Search size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search by name, type, or id..."
                />
            </label>

            <div className="files-toolbar-actions">
                {onRefresh && (
                    <button
                        className="secondary-file-btn"
                        onClick={onRefresh}
                        disabled={refreshing}
                        type="button"
                    >
                        <RefreshCw size={18} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                )}

                {showUpload && (
                    <button
                        className="upload-btn"
                        onClick={onUploadClick}
                        disabled={uploading}
                        type="button"
                    >
                        <Upload size={18} />
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FileToolbar;
