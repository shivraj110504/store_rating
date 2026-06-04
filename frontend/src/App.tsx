import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import Sidebar from './components/common/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';
import UserStores from './pages/user/UserStores';
import ChangePassword from './pages/user/ChangePassword';
import OwnerDashboard from './pages/store-owner/OwnerDashboard';

function WithSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function RequireAuth({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) {
    // Redirect to correct home instead of login loop
    if (user?.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
    if (user?.role === UserRole.STORE_OWNER) return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/user/stores" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const homePath =
    user?.role === UserRole.ADMIN ? '/admin' :
    user?.role === UserRole.STORE_OWNER ? '/owner/dashboard' :
    '/user/stores';

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={homePath} replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to={homePath} replace /> : <RegisterPage />
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <RequireAuth role={UserRole.ADMIN}>
          <WithSidebar><AdminDashboard /></WithSidebar>
        </RequireAuth>
      } />
      <Route path="/admin/users" element={
        <RequireAuth role={UserRole.ADMIN}>
          <WithSidebar><AdminUsers /></WithSidebar>
        </RequireAuth>
      } />
      <Route path="/admin/stores" element={
        <RequireAuth role={UserRole.ADMIN}>
          <WithSidebar><AdminStores /></WithSidebar>
        </RequireAuth>
      } />

      {/* Normal user routes */}
      <Route path="/user/stores" element={
        <RequireAuth role={UserRole.USER}>
          <WithSidebar><UserStores /></WithSidebar>
        </RequireAuth>
      } />
      <Route path="/user/password" element={
        <RequireAuth role={UserRole.USER}>
          <WithSidebar><ChangePassword /></WithSidebar>
        </RequireAuth>
      } />

      {/* Store owner routes */}
      <Route path="/owner/dashboard" element={
        <RequireAuth role={UserRole.STORE_OWNER}>
          <WithSidebar><OwnerDashboard /></WithSidebar>
        </RequireAuth>
      } />
      <Route path="/owner/password" element={
        <RequireAuth role={UserRole.STORE_OWNER}>
          <WithSidebar><ChangePassword /></WithSidebar>
        </RequireAuth>
      } />

      {/* Catch all */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to={homePath} replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#16161e',
              color: '#e8e8f0',
              border: '1px solid #2a2a38',
              borderRadius: 10,
              fontSize: 14,
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#16161e' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#16161e' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
