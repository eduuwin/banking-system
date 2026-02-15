import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

// User Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Pix from './pages/Pix';
import QrCode from './pages/QrCode';
import History from './pages/History';
import Profile from './pages/Profile';
import KycVerification from './pages/KycVerification';
import Security from './pages/Security';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminKyc from './pages/admin/AdminKyc';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminGateway from './pages/admin/AdminGateway';
import AdminLogs from './pages/admin/AdminLogs';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Carregando...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Carregando...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user.is_admin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Public Route (redirect to home if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Carregando...</div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// App Layout
function AppLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  return (
    <div style={{ minHeight: '100vh', paddingBottom: user && !isAuthPage ? '80px' : '0' }}>
      {!isAuthPage && <Navbar />}
      <main>
        {children}
      </main>
      {user && !isAuthPage && <BottomNav />}
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected User Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/deposit" element={
          <ProtectedRoute>
            <Deposit />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        } />
        <Route path="/pix" element={
          <ProtectedRoute>
            <Pix />
          </ProtectedRoute>
        } />
        <Route path="/qrcode" element={
          <ProtectedRoute>
            <QrCode />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/kyc" element={
          <ProtectedRoute>
            <KycVerification />
          </ProtectedRoute>
        } />
        <Route path="/security" element={
          <ProtectedRoute>
            <Security />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } />
        <Route path="/admin/kyc" element={
          <AdminRoute>
            <AdminKyc />
          </AdminRoute>
        } />
        <Route path="/admin/transactions" element={
          <AdminRoute>
            <AdminTransactions />
          </AdminRoute>
        } />
        <Route path="/admin/gateway" element={
          <AdminRoute>
            <AdminGateway />
          </AdminRoute>
        } />
        <Route path="/admin/logs" element={
          <AdminRoute>
            <AdminLogs />
          </AdminRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </AuthProvider>
  );
}

export default App;
