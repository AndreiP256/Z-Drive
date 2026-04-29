import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from './../../assets/logo.png'

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const loginSchema = Yup.object().shape({
        email: Yup.string().email('Email invalid').required('Obligatoriu'),
        password: Yup.string().required('Obligatoriu'),
    });

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            const response = await api.post('/auth/login', values);
            login(response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setStatus({ error: "Email sau parolă incorectă" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-viewport">
            <div className="login-container">
                <div className="brand-section">
                    <div className="logo-container-image">
                        <img src={logo} alt="Z-Drive Logo" className="brand-logo" />
                    </div>
                    <h1>Z-Drive Enterprise</h1>
                    <p>Institutional security for your corporate data infrastructure.</p>
                </div>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={loginSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, status }) => (
                        <Form className="login-form">
                            <div className="field-group">
                                <label>Corporate Email</label>
                                <Field type="email" name="email" placeholder="name@company.com" />
                                <ErrorMessage name="email" component="div" className="error-text" />
                            </div>

                            <div className="field-group">
                                <label>Password</label>
                                <Field type="password" name="password" placeholder="••••••••" />
                                <ErrorMessage name="password" component="div" className="error-text" />
                            </div>

                            {status?.error && <div className="login-alert">{status.error}</div>}

                            <button type="submit" className="login-button" disabled={isSubmitting}>
                                {isSubmitting ? 'Authenticating...' : 'Sign In →'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default LoginPage;