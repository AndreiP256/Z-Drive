import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './router/ProtectedRoute';
import LoginPage from './pages/login/LoginPage';
import AdminPage from './pages/AdminPage';
import NotFound from './pages/not_found/NotFound';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rute Publice */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/unauthorized" element={<h1>Neautorizat</h1>} />

                    {/* Rute Protejate */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <h1>Bine ai venit în Z-Drive!</h1>
                        </ProtectedRoute>
                    } />

                    {/* Rute de Admin */}
                    <Route path="/dashboard/users" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Redirecționare default */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;