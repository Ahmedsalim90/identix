import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { initials, getAvatarColor } from '../data/mockData.js';

const NAV = {
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { key: 'attendance', label: 'Take Attendance', icon: 'ti-clipboard-check' },
    { key: 'students', label: 'Students', icon: 'ti-users' },
    { key: 'reports', label: 'Reports', icon: 'ti-chart-bar' },
    { key: 'teachers', label: 'Teachers', icon: 'ti-chalkboard' },
    { key: 'settings', label: 'Settings', icon: 'ti-settings' },
  ],
  teacher: [
    { key: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { key: 'attendance', label: 'Take Attendance', icon: 'ti-clipboard-check' },
    { key: 'students', label: 'My Students', icon: 'ti-users' },
    { key: 'reports', label: 'Reports', icon: 'ti-chart-bar' },
  ],
  student: [
    { key: 'dashboard', label: 'My Dashboard', icon: 'ti-layout-dashboard' },
    { key: 'myattendance', label: 'My Attendance', icon: 'ti-calendar-check' },
    { key: 'timetable', label: 'Timetable', icon: 'ti-calendar' },
  ],
};

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const navItems = NAV[user?.role] || [];
  const ac = getAvatarColor(0);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">
            <i className="ti ti-school" aria-hidden="true" />
          </div>
          <div>
            <div className="logo-text">A.Reccord</div>
            <div className="logo-sub">School Management</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Main Menu</div>
        {navItems.map(item => (
          <div
            key={item.key}
            className={`nav-item ${activePage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </div>
        ))}

        <div className="nav-section" style={{ marginTop: 20 }}>Account</div>
        <div className="nav-item" onClick={logout}>
          <i className="ti ti-logout" aria-hidden="true" />
          Sign Out
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar" style={{ background: ac.bg, color: ac.color }}>
            {initials(user?.name || 'U')}
          </div>
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
