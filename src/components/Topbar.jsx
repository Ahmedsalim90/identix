import React from 'react';

const PAGE_META = {
  dashboard:    { title: 'Dashboard',        sub: 'Overview & summary' },
  attendance:   { title: 'Take Attendance',  sub: 'Mark student attendance' },
  students:     { title: 'Students',         sub: 'Manage student records' },
  reports:      { title: 'Reports',          sub: 'Attendance analytics' },
  teachers:     { title: 'Teachers',         sub: 'Manage staff' },
  settings:     { title: 'Settings',         sub: 'System configuration' },
  myattendance: { title: 'My Attendance',    sub: 'Your attendance record' },
  timetable:    { title: 'Timetable',        sub: 'Weekly class schedule' },
};

export default function Topbar({ page }) {
  const meta = PAGE_META[page] || { title: page, sub: '' };
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{meta.title}</div>
        <div className="topbar-sub">{meta.sub}</div>
      </div>
      <div className="topbar-right">
        <div className="date-chip">
          <i className="ti ti-calendar" style={{ fontSize: 14 }} />
          {today}
        </div>
        <button className="btn btn-outline btn-sm" style={{ gap: 6 }}>
          <i className="ti ti-bell" style={{ fontSize: 15 }} />
          Alerts
        </button>
      </div>
    </header>
  );
}
