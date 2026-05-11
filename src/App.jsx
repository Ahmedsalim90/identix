import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import TeachersPage from './pages/TeachersPage.jsx';
import MyAttendancePage from './pages/MyAttendancePage.jsx';
import { SettingsPage, TimetablePage } from './pages/MiscPages.jsx';

function getDefaultPage(role) {
  return 'dashboard';
}

export default function App() {
  const { user } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        if (user.role === 'admin')   return <AdminDashboard   onNavigate={setPage} />;
        if (user.role === 'teacher') return <TeacherDashboard onNavigate={setPage} />;
        if (user.role === 'student') return <StudentDashboard onNavigate={setPage} />;
        return null;
      case 'attendance':   return <AttendancePage />;
      case 'students':     return <StudentsPage />;
      case 'reports':      return <ReportsPage />;
      case 'teachers':     return <TeachersPage />;
      case 'myattendance': return <MyAttendancePage />;
      case 'timetable':    return <TimetablePage />;
      case 'settings':     return <SettingsPage />;
      default:             return <div style={{ padding: 32, color: '#64748b' }}>Page not found.</div>;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="main">
        <Topbar page={page} />
        <main className="content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
