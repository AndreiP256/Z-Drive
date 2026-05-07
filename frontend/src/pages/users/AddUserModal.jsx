import { useState } from 'react';
import { createUser } from '../../api/usersApi';
import './AddUserModal.css';

const AddUserModal = ({ onClose, onUserAdded }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ANGAJAT',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const newUser = await createUser(form);
    onUserAdded(newUser);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add User</h2>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="ANGAJAT">Angajat</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
        </select>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;