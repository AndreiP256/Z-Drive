import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './router/ProtectedRoute';
import LoginPage from './pages/login/LoginPage';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/dashboard/Dashboard';
import NotFound from './pages/not_found/NotFound';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import DashboardLayout from './pages/dashboard/DashboardLayout';

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
                    {/* Toate aceste rute vor avea Sidebar și Header automat */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Rută protejată suplimentar prin rol */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
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