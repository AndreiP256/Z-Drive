import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './router/ProtectedRoute';
import LoginPage from './pages/login/LoginPage';
import Dashboard from './pages/dashboard/Dashboard';
import NotFound from './pages/not_found/NotFound';
import DashboardLayout from './components/dashboard-layout/DashboardLayout';
import UsersPage from './pages/users/UsersPage';
import SharedPage from './pages/shared/SharedPage';
import RolesPage from './pages/roles/RolesPage';
import AuditPage from './pages/audit/AuditPage';
import ProfilePage from './pages/profile/ProfilePage';
import Unauthorized from './pages/unauthorized/UnauthorizedPage';

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
                    <Route path="/shared" element={<SharedPage />} />
                    <Route path="/roles" element={<RolesPage />} />
                    <Route path="/audit" element={<AuditPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Rută protejată suplimentar prin rol */}
                    <Route path="/users" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <UsersPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/audit" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                            <AuditPage />
                        </ProtectedRoute>
                    } />
                </Route>

                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
