import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Mobile bottom navigation component
 */
const BottomNav = () => {
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/deposit', label: 'Depositar', icon: '💰' },
    { path: '/pix', label: 'PIX', icon: '⚡' },
    { path: '/transactions', label: 'Histórico', icon: '📋' },
    { path: '/profile', label: 'Perfil', icon: '👤' }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
