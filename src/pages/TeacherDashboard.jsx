import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { STUDENTS, ATTENDANCE_HISTORY, getAvatarColor, initials, computeStats } from '../data/mockData.js';

export default function TeacherDashboard({ onNavigate }) {
  const { user } = useAuth();
  const myClasses = user?.classes || [];
  const myStudents = STUDENTS.filter(s => myClasses.includes(s.class));
  const allDates = Object.keys(ATTENDANCE_HISTORY).sort().reverse();
  const todayDate = allDates[0] || '';

  const todayStats = useMemo(() => {
    const dayData = ATTENDANCE_HISTORY[todayDate] || {};
    const merged = {};
    myStudents.forEach(s => {
      Object.values(dayData).forEach(subj => {
        if (!merged[s.id] && subj[s.id]) merged[s.id] = subj[s.id];
      });
    });
    return computeStats(merged);
  }, [todayDate, myStudents]);

  const recentDates = allDates.slice(0, 5);

  const atRisk = useMemo(() => {
    return myStudents.map(s => {
      let p = 0, total = 0;
      allDates.slice(0, 20).forEach(d => {
        Object.values(ATTENDANCE_HISTORY[d] || {}).forEach(subj => {
          const st = subj[s.id];
          if (st) { total++; if (st === 'present' || st === 'late') p++; }
        });
      });
      return { ...s, rate: total ? Math.round(p / total * 100) : 0 };
    }).filter(s => s.rate < 80).sort((a, b) => a.rate - b.rate).slice(0, 4);
  }, [myStudents, allDates]);

  return (
    <div className="fade-up">
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', borderRadius: 16, padding: '20px 24px', marginBottom: 22, color: '#fff' }}>
        <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 4 }}>Welcome back,</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>{user?.name}</div>
        <div style={{ fontSize: 13, opacity: 0.65, marginTop: 6 }}>
          Classes: {myClasses.join(' · ')} &nbsp;|&nbsp; Subjects: {user?.subjects?.join(', ')}
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'My Students', value: myStudents.length, sub: `Across ${myClasses.length} classes`, icon: 'ti-users', color: '#2563eb' },
          { label: 'Present Today', value: todayStats.present, sub: `${todayStats.rate}% attendance rate`, icon: 'ti-circle-check', color: '#16a34a' },
          { label: 'Absent Today', value: todayStats.absent, sub: 'Need follow-up', icon: 'ti-circle-x', color: '#dc2626' },
          { label: 'Late Arrivals', value: todayStats.late, sub: 'This session', icon: 'ti-clock', color: '#d97706' },
        ].map((c, i) => (
          <div key={i} className="stat-card fade-up" style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="stat-label">
              <span className="stat-icon" style={{ background: c.color + '18' }}>
                <i className={`ti ${c.icon}`} style={{ fontSize: 15, color: c.color }} />
              </span>
              {c.label}
            </div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent sessions */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><i className="ti ti-history" />Recent Sessions</span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('reports')}>View Reports</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Present</th><th>Absent</th><th>Rate</th></tr></thead>
              <tbody>
                {recentDates.map(date => {
                  const dayData = ATTENDANCE_HISTORY[date] || {};
                  const merged = {};
                  myStudents.forEach(s => {
                    Object.values(dayData).forEach(subj => {
                      if (!merged[s.id] && subj[s.id]) merged[s.id] = subj[s.id];
                    });
                  });
                  const s = computeStats(merged);
                  return (
                    <tr key={date}>
                      <td style={{ fontSize: 12.5 }}>{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td style={{ color: '#16a34a', fontWeight: 600 }}>{s.present}</td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>{s.absent}</td>
                      <td><span className={`badge badge-${s.rate >= 85 ? 'good' : s.rate >= 70 ? 'watch' : 'risk'}`}>{s.rate}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* At risk students */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><i className="ti ti-alert-triangle" />Low Attendance</span>
          </div>
          {atRisk.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
              <i className="ti ti-circle-check" style={{ fontSize: 32, color: '#16a34a', display: 'block', marginBottom: 8 }} />
              All students above 80%
            </div>
          ) : atRisk.map((s, i) => {
            const ac = getAvatarColor(i);
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="avatar" style={{ background: ac.bg, color: ac.color }}>{initials(s.name)}</div>
                <div style={{ flex: 1 }}>
                  <div className="student-name">{s.name}</div>
                  <div className="student-meta">{s.class}</div>
                </div>
                <span className="badge badge-risk">{s.rate}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-header">
          <span className="panel-title"><i className="ti ti-bolt" />Quick Actions</span>
        </div>
        <div className="panel-body" style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => onNavigate('attendance')}>
            <i className="ti ti-clipboard-check" />Take Attendance
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate('reports')}>
            <i className="ti ti-chart-bar" />View Reports
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate('students')}>
            <i className="ti ti-users" />My Students
          </button>
        </div>
      </div>
    </div>
  );
}
