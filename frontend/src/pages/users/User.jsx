import { EditIcon, TrashIcon} from 'lucide-react';
import './UserPage.css';
const User = ({ user }) => {
    return (
        <tr className="users-table-body-row">
            <td className="users-table-cell name-cell">{user.name}</td>
            <td className="users-table-cell email-cell">{user.email}</td>
            <td className="users-table-cell">
                <span className="role-badge">{user.role}</span>
            </td>
            <td className="users-table-cell">
                <span className={`users-status-badge users-status-${user.status.toLowerCase()}`}>
                    {user.status}
                </span>
            </td>
            <td className="users-table-cell users-table-actions-cell">
                <button className="users-action-button" ><EditIcon className="user-action-icon" /></button>
                <button className="users-action-button"><TrashIcon className="user-action-icon" /></button>
            </td>
        </tr>
    );
};

export default User;