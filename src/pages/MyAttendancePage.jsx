import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ATTENDANCE_HISTORY, SUBJECTS } from '../data/mockData.js';

export default function MyAttendancePage() {
  const { user } = useAuth();
  const allDates = Object.keys(ATTENDANCE_HISTORY).sort().reverse();

  const records = useMemo(() => {
    const list = [];
    allDates.forEach(date => {
      SUBJECTS.forEach(subject => {
        const st = (ATTENDANCE_HISTORY[date] || {})[subject]?.[user?.studentId];
        if (st) list.push({ date, subject, status: st });
      });
    });
    return list;
  }, [user?.studentId, allDates]);

  const stats = useMemo(() => {
    let p = 0, ab = 0, late = 0, ex = 0;
    records.forEach(r => {
      if (r.status === 'present') p++;
      else if (r.status === 'absent') ab++;
      else if (r.status === 'late') late++;
      else if (r.status === 'excused') ex++;
    });
    const total = p + ab + late + ex;
    return { present: p, absent: ab, late, excused: ex, total, rate: total ? Math.round((p + late) / total * 100) : 0 };
  }, [records]);

  const grouped = useMemo(() => {
    const g = {};
    records.forEach(r => {
      if (!g[r.date]) g[r.date] = [];
      g[r.date].push(r);
    });
    return Object.entries(g).slice(0, 15);
  }, [records]);

  return (
    <div className="fade-up">
      <div className="stats-grid">
        {[
          { label: 'Present', value: stats.present, color: '#16a34a', icon: 'ti-circle-check' },
          { label: 'Absent',  value: stats.absent,  color: '#dc2626', icon: 'ti-circle-x' },
          { label: 'Late',    value: stats.late,    color: '#d97706', icon: 'ti-clock' },
          { label: 'Overall Rate', value: `${stats.rate}%`, color: stats.rate >= 85 ? '#16a34a' : stats.rate >= 70 ? '#d97706' : '#dc2626', icon: 'ti-chart-bar' },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="stat-label">
              <i className={`ti ${c.icon}`} style={{ color: c.color, fontSize: 16 }} />{c.label}
            </div>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title"><i className="ti ti-calendar-check" />Attendance History</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Subject</th><th>Status</th></tr>
            </thead>
            <tbody>
              {grouped.flatMap(([date, recs]) =>
                recs.map((r, i) => (
                  <tr key={`${date}-${r.subject}`}>
                    <td style={{ fontSize: 13 }}>
                      {i === 0 ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                    </td>
                    <td style={{ fontSize: 13.5, fontWeight: 500 }}>{r.subject}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
