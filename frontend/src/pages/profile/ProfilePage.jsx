import {uploadProfilePicture} from '../../api/filesApi.jsx';
import {useState, useRef} from 'react';


const ProfilePage = () => {

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const uploadPicture = async (e) => {
        setUploading(true);
        try {
            await uploadProfilePicture(e.target.files[0]);
            window.location.reload();
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            alert("Failed to upload profile picture.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="header-info">
                    <h1>Profile</h1>
                    <p>Manage your profile information and settings.</p>
                </div>

                <button className="upload-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                    <input type="file" ref={fileInputRef} onChange={uploadPicture} hidden />
                    {uploading ? "Uploading..." : "+ Upload Profile Picture"}
                </button>
            </header>
    </div>);
};

export default ProfilePage;