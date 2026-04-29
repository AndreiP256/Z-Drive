import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();


    return (
        <div className="admin-page">
            <h2>Admin Page</h2>
        </div>
    );
};

export default AdminPage;