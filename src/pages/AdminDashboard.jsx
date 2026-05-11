import React, { useMemo } from 'react';
import { STUDENTS, USERS, ATTENDANCE_HISTORY, getAvatarColor, initials, computeStats } from '../data/mockData.js';

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="stat-card fade-up">
      <div className="stat-label">
        <span className="stat-icon" style={{ background: color + '18' }}>
          <i className={`ti ${icon}`} style={{ fontSize: 15, color }} />
        </span>
        {label}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

export default function AdminDashboard({ onNavigate }) {
  const teachers = USERS.filter(u => u.role === 'teacher');
  const allDates = Object.keys(ATTENDANCE_HISTORY).sort().reverse();
  const todayDate = allDates[0] || '';

  const todayStats = useMemo(() => {
    const dayData = ATTENDANCE_HISTORY[todayDate] || {};
    const merged = {};
    Object.values(dayData).forEach(subj => {
      Object.entries(subj).forEach(([sid, status]) => {
        if (!merged[sid]) merged[sid] = status;
      });
    });
    return computeStats(merged);
  }, [todayDate]);

  const weeklyRates = useMemo(() => {
    return allDates.slice(0, 7).map(date => {
      const dayData = ATTENDANCE_HISTORY[date] || {};
      const merged = {};
      Object.values(dayData).forEach(subj => {
        Object.entries(subj).forEach(([sid, status]) => {
          if (!merged[sid]) merged[sid] = status;
        });
      });
      const s = computeStats(merged);
      return {
        label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        rate: s.rate,
      };
    }).reverse();
  }, [allDates]);

  const atRiskStudents = useMemo(() => {
    return STUDENTS.map(s => {
      let p = 0, total = 0;
      allDates.forEach(d => {
        const dayData = ATTENDANCE_HISTORY[d] || {};
        Object.values(dayData).forEach(subj => {
          const status = subj[s.id];
          if (status) { total++; if (status === 'present' || status === 'late') p++; }
        });
      });
      return { ...s, rate: total ? Math.round(p / total * 100) : 0 };
    }).sort((a, b) => a.rate - b.rate).slice(0, 5);
  }, [allDates]);

  return (
    <div className="fade-up">
      <div className="stats-grid">
        <StatCard label="Total Students" value={STUDENTS.length} sub="Enrolled this term" icon="ti-users" color="#2563eb" />
        <StatCard label="Present Today" value={todayStats.present} sub={`Rate: ${todayStats.rate}%`} icon="ti-circle-check" color="#16a34a" />
        <StatCard label="Absent Today" value={todayStats.absent} sub="Requires follow-up" icon="ti-circle-x" color="#dc2626" />
        <StatCard label="Staff Members" value={teachers.length} sub="Active teachers" icon="ti-chalkboard" color="#7c3aed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Weekly Chart */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><i className="ti ti-chart-bar" />Weekly Attendance Rate</span>
          </div>
          <div className="panel-body">
            {weeklyRates.map((d, i) => (
              <div key={i} className="mini-bar-row">
                <span className="mini-bar-label">{d.label}</span>
                <div className="mini-bar-track">
                  <div className="mini-bar-fill" style={{ width: `${d.rate}%`, background: d.rate >= 85 ? '#16a34a' : d.rate >= 70 ? '#d97706' : '#dc2626' }} />
                </div>
                <span className="mini-bar-val" style={{ color: d.rate >= 85 ? '#16a34a' : d.rate >= 70 ? '#d97706' : '#dc2626' }}>{d.rate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* At Risk */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><i className="ti ti-alert-triangle" />Students At Risk</span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('students')}>View All</button>
          </div>
          <div>
            {atRiskStudents.map((s, i) => {
              const ac = getAvatarColor(i);
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                  <div className="avatar" style={{ background: ac.bg, color: ac.color }}>{initials(s.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="student-name">{s.name}</div>
                    <div className="progress" style={{ marginTop: 5 }}>
                      <div className="progress-fill" style={{ width: `${s.rate}%`, background: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626' }}>{s.rate}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title"><i className="ti ti-bolt" />Quick Actions</span>
        </div>
        <div className="panel-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Take Attendance', icon: 'ti-clipboard-check', page: 'attendance', color: '#2563eb' },
            { label: 'View Reports', icon: 'ti-chart-line', page: 'reports', color: '#7c3aed' },
            { label: 'Manage Students', icon: 'ti-users', page: 'students', color: '#16a34a' },
            { label: 'Manage Teachers', icon: 'ti-chalkboard', page: 'teachers', color: '#d97706' },
          ].map(a => (
            <button key={a.page} className="btn btn-outline" onClick={() => onNavigate(a.page)}>
              <i className={`ti ${a.icon}`} style={{ color: a.color, fontSize: 16 }} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
