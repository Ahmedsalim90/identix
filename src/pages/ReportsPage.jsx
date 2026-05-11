import React, { useState, useMemo } from 'react';
import { STUDENTS, CLASSES, SUBJECTS, ATTENDANCE_HISTORY, getAvatarColor, initials, computeStats } from '../data/mockData.js';

export default function ReportsPage() {
  const [tab, setTab] = useState('summary');
  const allDates = Object.keys(ATTENDANCE_HISTORY).sort().reverse();
  const today = new Date();

  const studentSummaries = useMemo(() => {
    return STUDENTS.map(s => {
      let p = 0, ab = 0, late = 0, ex = 0;
      allDates.forEach(d => {
        Object.values(ATTENDANCE_HISTORY[d] || {}).forEach(subj => {
          const st = subj[s.id];
          if (st === 'present') p++;
          else if (st === 'absent') ab++;
          else if (st === 'late') late++;
          else if (st === 'excused') ex++;
        });
      });
      const total = p + ab + late + ex;
      return { ...s, present: p, absent: ab, late, excused: ex, total, rate: total ? Math.round((p + late) / total * 100) : 0 };
    });
  }, [allDates]);

  const classRates = useMemo(() => {
    return CLASSES.map(cls => {
      const clsStudents = STUDENTS.filter(s => s.class === cls);
      let p = 0, total = 0;
      clsStudents.forEach(s => {
        allDates.forEach(d => {
          Object.values(ATTENDANCE_HISTORY[d] || {}).forEach(subj => {
            const st = subj[s.id];
            if (st) { total++; if (st === 'present' || st === 'late') p++; }
          });
        });
      });
      return { cls, rate: total ? Math.round(p / total * 100) : 0 };
    });
  }, [allDates]);

  const subjectRates = useMemo(() => {
    return SUBJECTS.map(sub => {
      let p = 0, total = 0;
      allDates.forEach(d => {
        const subData = (ATTENDANCE_HISTORY[d] || {})[sub] || {};
        Object.values(subData).forEach(st => {
          total++;
          if (st === 'present' || st === 'late') p++;
        });
      });
      return { sub, rate: total ? Math.round(p / total * 100) : 0 };
    });
  }, [allDates]);

  // Calendar for current month
  const calDays = useMemo(() => {
    const days = [];
    const m = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let i = 0; i < m.getDay(); i++) days.push(null);
    const dim = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) {
      const date = new Date(today.getFullYear(), today.getMonth(), d);
      const key = date.toISOString().slice(0, 10);
      const rec = ATTENDANCE_HISTORY[key];
      if (rec) {
        const merged = {};
        Object.values(rec).forEach(subj => {
          Object.entries(subj).forEach(([sid, st]) => { if (!merged[sid]) merged[sid] = st; });
        });
        const s = computeStats(merged);
        days.push({ day: d, rate: s.rate, isToday: d === today.getDate() });
      } else {
        days.push({ day: d, rate: null, isToday: d === today.getDate() });
      }
    }
    return days;
  }, []);

  return (
    <div className="fade-up">
      <div className="panel">
        <div className="tabs">
          {[
            { key: 'summary',  label: 'Summary',    icon: 'ti-chart-bar' },
            { key: 'students', label: 'By Student',  icon: 'ti-users' },
            { key: 'calendar', label: 'Calendar',    icon: 'ti-calendar' },
          ].map(t => (
            <div key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <i className={`ti ${t.icon}`} />{t.label}
            </div>
          ))}
        </div>

        {tab === 'summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 20 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <i className="ti ti-chart-pie" style={{ color: '#2563eb', fontSize: 16 }} />Attendance by Class
              </div>
              {classRates.map((c, i) => (
                <div key={i} className="mini-bar-row">
                  <span className="mini-bar-label">{c.cls}</span>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: `${c.rate}%`, background: c.rate >= 85 ? '#16a34a' : c.rate >= 70 ? '#d97706' : '#dc2626' }} />
                  </div>
                  <span className="mini-bar-val" style={{ color: c.rate >= 85 ? '#16a34a' : c.rate >= 70 ? '#d97706' : '#dc2626' }}>{c.rate}%</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <i className="ti ti-book" style={{ color: '#7c3aed', fontSize: 16 }} />Attendance by Subject
              </div>
              {subjectRates.map((s, i) => (
                <div key={i} className="mini-bar-row">
                  <span className="mini-bar-label">{s.sub}</span>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: `${s.rate}%`, background: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626' }} />
                  </div>
                  <span className="mini-bar-val" style={{ color: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626' }}>{s.rate}%</span>
                </div>
              ))}
            </div>

            <div style={{ gridColumn: '1 / -1', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', marginBottom: 14 }}>Overall Breakdown</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Present', pct: 78, color: '#16a34a' },
                  { label: 'Late',    pct: 8,  color: '#d97706' },
                  { label: 'Excused', pct: 7,  color: '#7c3aed' },
                  { label: 'Absent',  pct: 7,  color: '#dc2626' },
                ].map(item => (
                  <div key={item.label} style={{ flex: '1 1 120px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.pct}%</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{item.label}</div>
                    <div className="progress" style={{ marginTop: 8 }}>
                      <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'students' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Excused</th>
                  <th>Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentSummaries.map((s, i) => {
                  const ac = getAvatarColor(i);
                  const risk = s.rate >= 85 ? 'good' : s.rate >= 70 ? 'watch' : 'risk';
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="student-info">
                          <div className="avatar" style={{ background: ac.bg, color: ac.color }}>{initials(s.name)}</div>
                          <div>
                            <div className="student-name">{s.name}</div>
                            <div className="student-meta">{s.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{s.class}</td>
                      <td style={{ color: '#16a34a', fontWeight: 600 }}>{s.present}</td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>{s.absent}</td>
                      <td style={{ color: '#d97706', fontWeight: 600 }}>{s.late}</td>
                      <td style={{ color: '#7c3aed', fontWeight: 600 }}>{s.excused}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 56, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${s.rate}%`, height: '100%', background: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626' }}>{s.rate}%</span>
                        </div>
                      </td>
                      <td><span className={`badge badge-${risk}`}>{s.rate >= 85 ? 'Good' : s.rate >= 70 ? 'Watch' : 'At Risk'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'calendar' && (
          <div>
            <div style={{ padding: '16px 20px 0', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div className="cal-grid">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="cal-header">{d}</div>)}
              {calDays.map((d, i) => {
                if (!d) return <div key={`e${i}`} />;
                const cls = d.rate === null ? 'no-data' : d.rate >= 85 ? 'high' : d.rate >= 70 ? 'mid' : 'low';
                return (
                  <div key={i} className={`cal-day ${cls} ${d.isToday ? 'today' : ''}`} title={d.rate !== null ? `${d.rate}% attendance` : ''}>
                    {d.day}
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '0 20px 16px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: '≥85% Good',    bg: '#dcfce7', border: '#15803d' },
                { label: '70–84% Watch', bg: '#fef9c3', border: '#a16207' },
                { label: '<70% Low',     bg: '#fee2e2', border: '#b91c1c' },
                { label: 'No session',   bg: '#f8fafc', border: '#cbd5e1' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                  <div style={{ width: 14, height: 14, background: l.bg, border: `1px solid ${l.border}40`, borderRadius: 3 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
