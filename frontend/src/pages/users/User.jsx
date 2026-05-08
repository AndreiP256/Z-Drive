import { EditIcon, TrashIcon} from 'lucide-react';
import './UserPage.css';
import { useState, useEffect } from 'react';
import { deleteUser } from '../../api/usersApi';


const possibleStatuses = ['Active', 'Inactive'];
const status = possibleStatuses[Math.floor(Math.random() * 2)];


const User = ({ user, onDelete, onEdit }) => {
    return (
        <tr className="users-table-body-row">
            <td className="users-table-cell name-cell">{user.name}</td>
            <td className="users-table-cell email-cell">{user.email}</td>
            <td className="users-table-cell">
                <span className={`role-badge role-badge-${user.role.toLowerCase()}`}>
                    {user.role}
                </span>
            </td>
            <td className="users-table-cell">
                <span className={`users-status-badge users-status-${status.toLowerCase()}`}>
                    {status}
                </span>
            </td>
            <td className="users-table-cell users-table-actions-cell">
                <button className="users-action-button" onClick={() => onEdit()}>
                    <EditIcon className="user-action-icon" />
                </button>
                <button className="users-action-button" onClick={() => onDelete(user.id)}>
                    <TrashIcon className="user-action-icon" />
                </button>
            </td>
        </tr>
    );
};

export default User;