import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './router/ProtectedRoute';
import LoginPage from './pages/login/LoginPage';
import Dashboard from './pages/dashboard/Dashboard';
import NotFound from './pages/not_found/NotFound';
import DashboardLayout from './components/dashboard-layout/DashboardLayout';

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

                {/* Rute Protejate cu Layout Comun */}
                <Route element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Rută protejată suplimentar prin rol */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <h1>Ruta de admin daca avem</h1>
                        </ProtectedRoute>
                    } />
                </Route>

                <Route path="/unauthorized" element={<h1>Neautorizat</h1>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;