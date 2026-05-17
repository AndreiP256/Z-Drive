import React, { useEffect, useMemo, useState } from 'react';
import './RolesPage.css';
import { getUsers } from '../../api/usersApi';
import { getAccessibleFiles } from '../../api/filesApi';
import {
    assignRoleToUser,
    createFileRole,
    deleteFileRole,
    getFileRole,
    getRolesForUser,
    revokeRoleFromUser,
    updateFileRole,
} from '../../api/rolesApi';

const DEFAULT_ROLE_FORM = {
    name: '',
    fileId: '',
    permissions: ['READ'],
};

const DEFAULT_ASSIGN_FORM = {
    userId: '',
    fileRoleId: '',
};

const PERMISSION_OPTIONS = ['READ', 'WRITE', 'DELETE'];

const RolesPage = () => {
    const [users, setUsers] = useState([]);
    const [files, setFiles] = useState([]);

    const [createForm, setCreateForm] = useState(DEFAULT_ROLE_FORM);
    const [createSelectedUserIds, setCreateSelectedUserIds] = useState([]);

    const [editRoleId, setEditRoleId] = useState('');
    const [editForm, setEditForm] = useState(DEFAULT_ROLE_FORM);
    const [editLoaded, setEditLoaded] = useState(false);

    const [assignForm, setAssignForm] = useState(DEFAULT_ASSIGN_FORM);

    const [lookupUserId, setLookupUserId] = useState('');
    const [userRoles, setUserRoles] = useState([]);

    const [fileSearch, setFileSearch] = useState('');

    const [sectionFeedback, setSectionFeedback] = useState({
        create: null,
        edit: null,
        assign: null,
        lookup: null,
        files: null,
    });

    const [loading, setLoading] = useState({
        create: false,
        edit: false,
        assign: false,
        lookup: false,
        files: false,
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        await Promise.all([loadUsers(), loadFiles()]);
    };

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            setUsers([]);
        }
    };

    const loadFiles = async () => {
        try {
            setLoading((prev) => ({ ...prev, files: true }));
            clearSectionMessage('files');

            const data = await getAccessibleFiles();
            setFiles(Array.isArray(data) ? data : []);
        } catch (error) {
            setFiles([]);
            setSectionMessage('files', 'error', 'Failed to load available files.');
        } finally {
            setLoading((prev) => ({ ...prev, files: false }));
        }
    };

    const setSectionMessage = (section, type, text) => {
        setSectionFeedback((prev) => ({
            ...prev,
            [section]: { type, text },
        }));
    };

    const clearSectionMessage = (section) => {
        setSectionFeedback((prev) => ({
            ...prev,
            [section]: null,
        }));
    };

    const usersMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
    }, [users]);

    const filteredFiles = useMemo(() => {
        const query = fileSearch.trim().toLowerCase();
        if (!query) return files;

        return files.filter((file) => {
            const owner = usersMap[file.ownerId];
            const ownerLabel = owner
                ? `${owner.name} ${owner.email}`.toLowerCase()
                : String(file.ownerId || '').toLowerCase();

            return (
                String(file.name || '').toLowerCase().includes(query) ||
                String(file.id || '').toLowerCase().includes(query) ||
                String(file.type || '').toLowerCase().includes(query) ||
                ownerLabel.includes(query)
            );
        });
    }, [files, fileSearch, usersMap]);

    const togglePermission = (form, setForm, permission) => {
        const alreadySelected = form.permissions.includes(permission);

        if (alreadySelected) {
            setForm({
                ...form,
                permissions: form.permissions.filter((p) => p !== permission),
            });
            return;
        }

        setForm({
            ...form,
            permissions: [...form.permissions, permission],
        });
    };

    const toggleCreateUserSelection = (userId) => {
        setCreateSelectedUserIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const validateRoleForm = (form, section) => {
        if (!form.name.trim()) {
            setSectionMessage(section, 'error', 'Role name is required.');
            return false;
        }

        if (!form.fileId.trim()) {
            setSectionMessage(section, 'error', 'File ID is required.');
            return false;
        }

        if (form.permissions.length === 0) {
            setSectionMessage(section, 'error', 'Select at least one permission.');
            return false;
        }

        return true;
    };

    const populateEditForm = (role) => {
        setEditForm({
            name: role.name || '',
            fileId: role.fileId || '',
            permissions: role.permissions || [],
        });
        setEditLoaded(true);
    };

    const handleCreateRole = async () => {
        clearSectionMessage('create');

        if (!validateRoleForm(createForm, 'create')) return;

        try {
            setLoading((prev) => ({ ...prev, create: true }));
            const createdRole = await createFileRole(createForm);

            setEditRoleId(createdRole.id);
            populateEditForm(createdRole);
            setAssignForm((prev) => ({
                ...prev,
                fileRoleId: createdRole.id,
            }));

            if (createSelectedUserIds.length === 0) {
                setSectionMessage('create', 'success', `Role "${createdRole.name}" created successfully.`);
                setCreateForm(DEFAULT_ROLE_FORM);
                return;
            }

            const assignmentResults = await Promise.allSettled(
                createSelectedUserIds.map((userId) =>
                    assignRoleToUser({
                        userId,
                        fileRoleId: createdRole.id,
                    })
                )
            );

            const successCount = assignmentResults.filter((result) => result.status === 'fulfilled').length;
            const failedUserIds = createSelectedUserIds.filter((_, index) => assignmentResults[index].status === 'rejected');

            setCreateForm(DEFAULT_ROLE_FORM);

            if (failedUserIds.length === 0) {
                setCreateSelectedUserIds([]);
                setSectionMessage(
                    'create',
                    'success',
                    `Role "${createdRole.name}" created and assigned to ${successCount} user(s).`
                );
            } else if (successCount > 0) {
                setCreateSelectedUserIds(failedUserIds);
                setSectionMessage(
                    'create',
                    'error',
                    `Role "${createdRole.name}" was created. Assigned to ${successCount} user(s), but ${failedUserIds.length} assignment(s) failed.`
                );
            } else {
                setCreateSelectedUserIds(failedUserIds);
                setSectionMessage(
                    'create',
                    'error',
                    `Role "${createdRole.name}" was created, but user assignment failed.`
                );
            }
        } catch (error) {
            const backendMessage = error?.response?.data?.message;
            setSectionMessage('create', 'error', backendMessage || 'Failed to create role.');
        } finally {
            setLoading((prev) => ({ ...prev, create: false }));
        }
    };

    const handleLoadRole = async () => {
        clearSectionMessage('edit');

        if (!editRoleId.trim()) {
            setSectionMessage('edit', 'error', 'Enter a role ID first.');
            return;
        }

        try {
            setLoading((prev) => ({ ...prev, edit: true }));
            const role = await getFileRole(editRoleId);
            populateEditForm(role);
            setSectionMessage('edit', 'success', `Role "${role.name}" loaded.`);
        } catch (error) {
            setEditLoaded(false);
            const backendMessage = error?.response?.data?.message;
            setSectionMessage('edit', 'error', backendMessage || 'Failed to load role. Check the role ID.');
        } finally {
            setLoading((prev) => ({ ...prev, edit: false }));
        }
    };

    const handleUpdateRole = async () => {
        clearSectionMessage('edit');

        if (!editRoleId.trim()) {
            setSectionMessage('edit', 'error', 'Role ID is required for update.');
            return;
        }

        if (!validateRoleForm(editForm, 'edit')) return;

        try {
            setLoading((prev) => ({ ...prev, edit: true }));
            const updatedRole = await updateFileRole(editRoleId, editForm);
            populateEditForm(updatedRole);
            setSectionMessage('edit', 'success', `Role "${updatedRole.name}" updated successfully.`);
        } catch (error) {
            const backendMessage = error?.response?.data?.message;
            setSectionMessage('edit', 'error', backendMessage || 'Failed to update role.');
        } finally {
            setLoading((prev) => ({ ...prev, edit: false }));
        }
    };

    const handleDeleteRole = async () => {
        clearSectionMessage('edit');

        if (!editRoleId.trim()) {
            setSectionMessage('edit', 'error', 'Role ID is required for delete.');
            return;
        }

        const confirmed = window.confirm('Are you sure you want to delete this role?');
        if (!confirmed) return;

        try {
            setLoading((prev) => ({ ...prev, edit: true }));
            await deleteFileRole(editRoleId);

            setSectionMessage('edit', 'success', 'Role deleted successfully.');
            setEditRoleId('');
            setEditForm(DEFAULT_ROLE_FORM);
            setEditLoaded(false);
        } catch (error) {
            const backendMessage = error?.response?.data?.message;
            setSectionMessage('edit', 'error', backendMessage || 'Failed to delete role.');
        } finally {
            setLoading((prev) => ({ ...prev, edit: false }));
        }
    };

    const handleAssignRole = async () => {
        clearSectionMessage('assign');

        if (!assignForm.userId.trim() || !assignForm.fileRoleId.trim()) {
            setSectionMessage('assign', 'error', 'User ID and File Role ID are required.');
            return;
        }

        try {
            setLoading((prev) => ({ ...prev, assign: true }));
            await assignRoleToUser(assignForm);
            setSectionMessage('assign', 'success', 'Role assigned successfully.');

            if (lookupUserId && lookupUserId === assignForm.userId) {
                await handleLoadUserRoles(assignForm.userId);
            }

            setAssignForm(DEFAULT_ASSIGN_FORM);
        } catch (error) {
            const backendMessage = error?.response?.data?.message;
            setSectionMessage('assign', 'error', backendMessage || 'Failed to assign role.');
        } finally {
            setLoading((prev) => ({ ...prev, assign: false }));
        }
    };

    const handleLoadUserRoles = async (forcedUserId) => {
        clearSectionMessage('lookup');

        const userIdToLoad = forcedUserId || lookupUserId;

        if (!userIdToLoad.trim()) {
            setSectionMessage('lookup', 'error', 'User ID is required to view assigned roles.');
            return;
        }

        try {
            setLoading((prev) => ({ ...prev, lookup: true }));
            const roles = await getRolesForUser(userIdToLoad);
            setUserRoles(Array.isArray(roles) ? roles : []);
            setLookupUserId(userIdToLoad);

            if ((roles || []).length === 0) {
                setSectionMessage('lookup', 'success', 'No roles assigned to this user.');
            } else {
                setSectionMessage('lookup', 'success', 'Assignments loaded successfully.');
            }
        } catch (error) {
            setUserRoles([]);
            const backendMessage = error?.response?.data?.message;
            setSectionMessage('lookup', 'error', backendMessage || 'Failed to load roles for user.');
        } finally {
            setLoading((prev) => ({ ...prev, lookup: false }));
        }
    };

    const handleRevokeRole = async (fileRoleId) => {
        clearSectionMessage('lookup');

        if (!lookupUserId) {
            setSectionMessage('lookup', 'error', 'No selected user for revoke.');
            return;
        }

        try {
            await revokeRoleFromUser({
                userId: lookupUserId,
                fileRoleId,
            });

            setSectionMessage('lookup', 'success', 'Role revoked successfully.');
            await handleLoadUserRoles(lookupUserId);
        } catch (error) {
            const backendMessage = error?.response?.data?.message;
            setSectionMessage('lookup', 'error', backendMessage || 'Failed to revoke role.');
        }
    };

    const handleRefresh = async () => {
        setSectionFeedback({
            create: null,
            edit: null,
            assign: null,
            lookup: null,
            files: null,
        });

        await loadFiles();

        if (lookupUserId) {
            await handleLoadUserRoles(lookupUserId);
        }

        if (editRoleId) {
            await handleLoadRole();
        }
    };

    const handleUseFileInCreate = (fileId) => {
        setCreateForm((prev) => ({
            ...prev,
            fileId,
        }));
        setSectionMessage('create', 'success', 'File selected for role creation.');
    };

    const getOwnerLabel = (ownerId) => {
        const owner = usersMap[ownerId];
        if (!owner) return String(ownerId || '-');
        return `${owner.name} (${owner.email})`;
    };

    const formatFileSize = (size) => {
        if (size == null) return '-';
        if (size < 1024) return `${size.toFixed(0)} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    const shortenId = (value) => {
        if (!value) return '-';
        const stringValue = String(value);
        if (stringValue.length <= 16) return stringValue;
        return `${stringValue.slice(0, 8)}...${stringValue.slice(-8)}`;
    };

    return (
        <div className="roles-page">
            <header className="page-header">
                <div className="header-info">
                    <h1>Role Management</h1>
                    <p>Manage file roles, permissions, and user role assignments.</p>
                </div>

                <button className="upload-btn" onClick={handleRefresh}>
                    Refresh
                </button>
            </header>

            <section className="role-card role-card-wide">
                <div className="role-card-header">
                    <h2>Available Files</h2>
                    <p>Select a file directly from here instead of copying the UUID manually.</p>
                </div>

                {sectionFeedback.files?.text && (
                    <div className={`roles-feedback ${sectionFeedback.files.type === 'error' ? 'roles-feedback-error' : 'roles-feedback-success'}`}>
                        {sectionFeedback.files.text}
                    </div>
                )}

                <div className="files-toolbar">
                    <input
                        type="text"
                        className="files-search-input"
                        placeholder="Search by file name, owner, id, or type..."
                        value={fileSearch}
                        onChange={(e) => setFileSearch(e.target.value)}
                    />
                </div>

                {loading.files ? (
                    <div className="empty-inline-state">Loading available files...</div>
                ) : filteredFiles.length > 0 ? (
                    <div className="roles-table-container">
                        <div className="roles-table-wrapper">
                            <table className="roles-table">
                                <thead>
                                    <tr className="roles-table-header-row">
                                        <th className="roles-table-header-cell">Owner</th>
                                        <th className="roles-table-header-cell">File Name</th>
                                        <th className="roles-table-header-cell">File ID</th>
                                        <th className="roles-table-header-cell">Type / Size</th>
                                        <th className="roles-table-header-cell roles-table-actions-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.map((file) => (
                                        <tr
                                            key={file.id}
                                            className={`roles-table-body-row ${createForm.fileId === file.id ? 'roles-table-row-selected' : ''}`}
                                        >
                                            <td className="roles-table-cell">{getOwnerLabel(file.ownerId)}</td>
                                            <td className="roles-table-cell role-name-cell">{file.name}</td>
                                            <td className="roles-table-cell role-id-cell" title={file.id}>
                                                {shortenId(file.id)}
                                            </td>
                                            <td className="roles-table-cell file-meta-cell">
                                                <div>{file.type || '-'}</div>
                                                <div className="file-meta-secondary">{formatFileSize(file.size)}</div>
                                            </td>
                                            <td className="roles-table-cell roles-table-actions-cell">
                                                <button
                                                    className="secondary-btn"
                                                    onClick={() => handleUseFileInCreate(file.id)}
                                                >
                                                    Use in Create
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="empty-inline-state">
                        No files available for selection.
                    </div>
                )}
            </section>

            <div className="roles-grid">
                <section className="role-card">
                    <div className="role-card-header">
                        <h2>Create File Role</h2>
                        <p>Create a file-specific role with one or more permissions.</p>
                    </div>

                    {sectionFeedback.create?.text && (
                        <div className={`roles-feedback ${sectionFeedback.create.type === 'error' ? 'roles-feedback-error' : 'roles-feedback-success'}`}>
                            {sectionFeedback.create.text}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Role name</label>
                            <input
                                type="text"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                placeholder="Viewer / Editor / Custom Role"
                            />
                        </div>

                        <div className="form-group">
                            <label>File ID</label>
                            <input
                                type="text"
                                value={createForm.fileId}
                                onChange={(e) => setCreateForm({ ...createForm, fileId: e.target.value })}
                                placeholder="Paste file UUID"
                            />
                        </div>

                        <div className="form-group form-group-full">
                            <label>Permissions</label>
                            <div className="permissions-list">
                                {PERMISSION_OPTIONS.map((permission) => (
                                    <label key={permission} className="permission-chip">
                                        <input
                                            type="checkbox"
                                            checked={createForm.permissions.includes(permission)}
                                            onChange={() => togglePermission(createForm, setCreateForm, permission)}
                                        />
                                        <span>{permission}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group form-group-full">
                            <div className="user-picker-header">
                                <label>Assign to users after creation</label>
                                <span className="selected-users-count">
                                    {createSelectedUserIds.length} selected
                                </span>
                            </div>

                            <div className="user-checkbox-list">
                                {users.length > 0 ? (
                                    users.map((user) => {
                                        const isSelected = createSelectedUserIds.includes(user.id);

                                        return (
                                            <label
                                                key={user.id}
                                                className={`user-checkbox-item ${isSelected ? 'user-checkbox-item-selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleCreateUserSelection(user.id)}
                                                />
                                                <div className="user-checkbox-content">
                                                    <span className="user-checkbox-name">{user.name}</span>
                                                    <span className="user-checkbox-email">{user.email}</span>
                                                </div>
                                            </label>
                                        );
                                    })
                                ) : (
                                    <div className="empty-inline-state">No users available.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-actions">
                        <button
                            className="primary-btn"
                            onClick={handleCreateRole}
                            disabled={loading.create}
                        >
                            {loading.create ? 'Creating...' : 'Create Role'}
                        </button>
                    </div>
                </section>

                <section className="role-card">
                    <div className="role-card-header">
                        <h2>Edit Existing Role</h2>
                        <p>Load a role by ID, then update or delete it.</p>
                    </div>

                    {sectionFeedback.edit?.text && (
                        <div className={`roles-feedback ${sectionFeedback.edit.type === 'error' ? 'roles-feedback-error' : 'roles-feedback-success'}`}>
                            {sectionFeedback.edit.text}
                        </div>
                    )}

                    <div className="inline-form">
                        <input
                            type="text"
                            value={editRoleId}
                            onChange={(e) => setEditRoleId(e.target.value)}
                            placeholder="Paste role UUID"
                        />
                        <button
                            className="secondary-btn"
                            onClick={handleLoadRole}
                            disabled={loading.edit}
                        >
                            Load Role
                        </button>
                    </div>

                    {editLoaded ? (
                        <>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Role name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>File ID</label>
                                    <input
                                        type="text"
                                        value={editForm.fileId}
                                        onChange={(e) => setEditForm({ ...editForm, fileId: e.target.value })}
                                    />
                                </div>

                                <div className="form-group form-group-full">
                                    <label>Permissions</label>
                                    <div className="permissions-list">
                                        {PERMISSION_OPTIONS.map((permission) => (
                                            <label key={permission} className="permission-chip">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.permissions.includes(permission)}
                                                    onChange={() => togglePermission(editForm, setEditForm, permission)}
                                                />
                                                <span>{permission}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions">
                                <button
                                    className="secondary-btn"
                                    onClick={handleUpdateRole}
                                    disabled={loading.edit}
                                >
                                    Update Role
                                </button>

                                <button
                                    className="danger-btn"
                                    onClick={handleDeleteRole}
                                    disabled={loading.edit}
                                >
                                    Delete Role
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="empty-inline-state">
                            Load a role by ID to start editing.
                        </div>
                    )}
                </section>

                <section className="role-card">
                    <div className="role-card-header">
                        <h2>Assign Role to User</h2>
                        <p>Attach an existing file role to a user.</p>
                    </div>

                    {sectionFeedback.assign?.text && (
                        <div className={`roles-feedback ${sectionFeedback.assign.type === 'error' ? 'roles-feedback-error' : 'roles-feedback-success'}`}>
                            {sectionFeedback.assign.text}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label>User</label>
                            <select
                                value={assignForm.userId}
                                onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                            >
                                <option value="">Select user</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>File Role ID</label>
                            <input
                                type="text"
                                value={assignForm.fileRoleId}
                                onChange={(e) => setAssignForm({ ...assignForm, fileRoleId: e.target.value })}
                                placeholder="Paste role UUID"
                            />
                        </div>
                    </div>

                    <div className="card-actions">
                        <button
                            className="primary-btn"
                            onClick={handleAssignRole}
                            disabled={loading.assign}
                        >
                            {loading.assign ? 'Assigning...' : 'Assign Role'}
                        </button>
                    </div>
                </section>

                <section className="role-card role-card-wide">
                    <div className="role-card-header">
                        <h2>User Role Assignments</h2>
                        <p>Inspect and revoke assigned roles for a selected user.</p>
                    </div>

                    {sectionFeedback.lookup?.text && (
                        <div className={`roles-feedback ${sectionFeedback.lookup.type === 'error' ? 'roles-feedback-error' : 'roles-feedback-success'}`}>
                            {sectionFeedback.lookup.text}
                        </div>
                    )}

                    <div className="inline-form user-lookup-bar">
                        <select
                            value={lookupUserId}
                            onChange={(e) => setLookupUserId(e.target.value)}
                        >
                            <option value="">Select user</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>

                        <button
                            className="secondary-btn"
                            onClick={() => handleLoadUserRoles()}
                            disabled={loading.lookup}
                        >
                            {loading.lookup ? 'Loading...' : 'Load Assignments'}
                        </button>
                    </div>

                    {userRoles.length > 0 ? (
                        <div className="roles-table-container">
                            <div className="roles-table-wrapper">
                                <table className="roles-table">
                                    <thead>
                                        <tr className="roles-table-header-row">
                                            <th className="roles-table-header-cell">Role Name</th>
                                            <th className="roles-table-header-cell">Role ID</th>
                                            <th className="roles-table-header-cell roles-table-actions-cell">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userRoles.map((role) => (
                                            <tr key={role.id} className="roles-table-body-row">
                                                <td className="roles-table-cell role-name-cell">{role.fileRoleName}</td>
                                                <td className="roles-table-cell role-id-cell">{role.fileRoleId}</td>
                                                <td className="roles-table-cell roles-table-actions-cell">
                                                    <button
                                                        className="roles-action-button danger-inline"
                                                        onClick={() => handleRevokeRole(role.fileRoleId)}
                                                    >
                                                        Revoke
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-inline-state">
                            No role assignments loaded yet.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default RolesPage;