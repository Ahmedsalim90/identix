import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { STUDENTS, ATTENDANCE_HISTORY, SUBJECTS } from '../data/mockData.js';

export default function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const student = STUDENTS.find(s => s.id === user?.studentId);
  const allDates = Object.keys(ATTENDANCE_HISTORY).sort().reverse();

  const stats = useMemo(() => {
    let p = 0, ab = 0, late = 0, ex = 0;
    allDates.forEach(d => {
      Object.values(ATTENDANCE_HISTORY[d] || {}).forEach(subj => {
        const st = subj[user?.studentId];
        if (st === 'present') p++;
        else if (st === 'absent') ab++;
        else if (st === 'late') late++;
        else if (st === 'excused') ex++;
      });
    });
    const total = p + ab + late + ex;
    return { present: p, absent: ab, late, excused: ex, total, rate: total ? Math.round((p + late) / total * 100) : 0 };
  }, [user?.studentId, allDates]);

  const subjectStats = useMemo(() => {
    return SUBJECTS.map(sub => {
      let p = 0, total = 0;
      allDates.forEach(d => {
        const st = (ATTENDANCE_HISTORY[d] || {})[sub]?.[user?.studentId];
        if (st) { total++; if (st === 'present' || st === 'late') p++; }
      });
      return { subject: sub, rate: total ? Math.round(p / total * 100) : 0, total };
    });
  }, [user?.studentId, allDates]);

  const recent = useMemo(() => {
    const entries = [];
    allDates.slice(0, 10).forEach(date => {
      SUBJECTS.forEach(sub => {
        const st = (ATTENDANCE_HISTORY[date] || {})[sub]?.[user?.studentId];
        if (st) entries.push({ date, subject: sub, status: st });
      });
    });
    return entries.slice(0, 8);
  }, [user?.studentId, allDates]);

  const rateColor = stats.rate >= 85 ? '#16a34a' : stats.rate >= 70 ? '#d97706' : '#dc2626';

  return (
    <div className="fade-up">
      {/* Profile card */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', borderRadius: 16, padding: '24px', marginBottom: 22, color: '#fff', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div className="avatar avatar-xl" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 22 }}>
          {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
          <div style={{ opacity: 0.65, fontSize: 13, marginTop: 4 }}>
            {student?.class} &nbsp;·&nbsp; ID: {user?.studentId}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: stats.rate >= 85 ? '#86efac' : stats.rate >= 70 ? '#fde68a' : '#fca5a5' }}>
            {stats.rate}%
          </div>
          <div style={{ fontSize: 12, opacity: 0.65 }}>Overall Rate</div>
        </div>
      </div>

      <div className="stats-grid stats-grid-3" style={{ marginBottom: 22 }}>
        {[
          { label: 'Present', value: stats.present, color: '#16a34a', icon: 'ti-circle-check' },
          { label: 'Absent', value: stats.absent, color: '#dc2626', icon: 'ti-circle-x' },
          { label: 'Late', value: stats.late, color: '#d97706', icon: 'ti-clock' },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="stat-label">
              <i className={`ti ${c.icon}`} style={{ color: c.color, fontSize: 16 }} />{c.label}
            </div>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-sub">{stats.total ? Math.round(c.value / stats.total * 100) : 0}% of sessions</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Subject breakdown */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><i className="ti ti-book" />Attendance by Subject</span>
          </div>
          <div className="panel-body">
            {subjectStats.map((s, i) => (
              <div key={i} className="mini-bar-row">
                <span className="mini-bar-label">{s.subject}</span>
                <div className="mini-bar-track">
                  <div className="mini-bar-fill" style={{ width: `${s.rate}%`, background: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626' }} />
                </div>
                <span className="mini-bar-val" style={{ color: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626' }}>{s.rate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent records */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><i className="ti ti-history" />Recent Records</span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('myattendance')}>View All</button>
          </div>
          <div>
            {recent.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{r.subject}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                <span className={`badge badge-${r.status}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
