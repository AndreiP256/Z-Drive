import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Schema de validare
    const loginSchema = Yup.object().shape({
        email: Yup.string()
            .email('Email invalid')
            .required('Email-ul este obligatoriu'),
        password: Yup.string()
            .min(6, 'Parola trebuie să aibă minim 6 caractere')
            .required('Parola este obligatorie'),
    });

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            const response = await api.post('/auth/login', values);
            login(response.data.token);
            navigate('/dashboard');
        } catch (err) {
            // Prindem eroarea din UserExceptionHandler-ul tău de pe backend
            const msg = err.response?.data?.message || "Eroare la autentificare";
            setStatus({ error: msg });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-card">
            <h2>Z-Drive Login</h2>
            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, status }) => (
                    <Form>
                        <div className="form-group">
                            <label>Email</label>
                            <Field type="email" name="email" />
                            <ErrorMessage name="email" component="div" className="error" />
                        </div>

                        <div className="form-group">
                            <label>Parolă</label>
                            <Field type="password" name="password" />
                            <ErrorMessage name="password" component="div" className="error" />
                        </div>

                        {status?.error && <div className="alert-error">{status.error}</div>}

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Se încarcă...' : 'Login'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default LoginPage;