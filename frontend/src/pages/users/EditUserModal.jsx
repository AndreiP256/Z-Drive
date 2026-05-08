import { useFormik } from 'formik';
import * as Yup from 'yup';
import { updateUser } from '../../api/usersApi';
import './UserModal.css';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters'),
  role: Yup.string().required('Role is required'),
});

const EditUserModal = ({ onClose, onUserChanged, user }) => {
  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'ANGAJAT',
    },
    validationSchema,

    onSubmit: async (values) => {
      try {
        const newUser = await updateUser(user.id, values);
        onUserChanged(newUser);
        onClose();
      } catch (error) {
        console.error('Failed to update user:', error);
      }
    },
  });

  const getFieldError = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit User</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <input
              name="name"
              placeholder="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={getFieldError('name') ? 'input-error' : ''}
            />
            {getFieldError('name') && (
              <span className="error-message">{getFieldError('name')}</span>
            )}
          </div>

          <div className="form-group">
            <input
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={getFieldError('email') ? 'input-error' : ''}
            />
            {getFieldError('email') && (
              <span className="error-message">{getFieldError('email')}</span>
            )}
          </div>

          <div className="form-group">
            <input
              name="password"
              placeholder="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={getFieldError('password') ? 'input-error' : ''}
            />
            {getFieldError('password') && (
              <span className="error-message">{getFieldError('password')}</span>
            )}
          </div>

          <div className="form-group">
            <select
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={getFieldError('role') ? 'input-error' : ''}
            >
              <option value="ANGAJAT">Angajat</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
            </select>
            {getFieldError('role') && (
              <span className="error-message">{getFieldError('role')}</span>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;