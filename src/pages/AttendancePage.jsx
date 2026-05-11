import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAttendance } from '../context/AttendanceContext.jsx';
import { STUDENTS, CLASSES, SUBJECTS, getAvatarColor, initials, computeStats } from '../data/mockData.js';

function StatusToggle({ value, onChange }) {
  const opts = [
    { key: 'present', label: 'Present', icon: 'ti-circle-check' },
    { key: 'late',    label: 'Late',    icon: 'ti-clock' },
    { key: 'excused', label: 'Excused', icon: 'ti-file-description' },
    { key: 'absent',  label: 'Absent',  icon: 'ti-circle-x' },
  ];
  return (
    <div className="status-toggle">
      {opts.map(o => (
        <button key={o.key} className={`status-btn ${o.key} ${value === o.key ? 'active' : ''}`} onClick={() => onChange(o.key)}>
          <i className={`ti ${o.icon}`} style={{ fontSize: 12 }} />
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();
  const { saveAttendance, getRecords } = useAttendance();

  const availableClasses = user?.role === 'admin' ? CLASSES : (user?.classes || []);
  const availableSubjects = user?.role === 'admin' ? SUBJECTS : (user?.subjects || []);

  const [selectedClass, setSelectedClass] = useState(availableClasses[0] || '');
  const [selectedSubject, setSelectedSubject] = useState(availableSubjects[0] || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState({});
  const [saved, setSaved] = useState(false);
  const [records, setRecords] = useState(() => {
    const r = {};
    STUDENTS.filter(s => s.class === (availableClasses[0] || '')).forEach(s => { r[s.id] = 'present'; });
    return r;
  });

  const classStudents = useMemo(() => STUDENTS.filter(s => s.class === selectedClass), [selectedClass]);

  const filtered = useMemo(() => classStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  ), [classStudents, search]);

  const stats = computeStats(records);

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    const existing = getRecords(selectedDate, selectedSubject);
    const newRec = {};
    STUDENTS.filter(s => s.class === cls).forEach(s => {
      newRec[s.id] = existing[s.id] || 'present';
    });
    setRecords(newRec);
    setSaved(false);
  };

  const markAll = (status) => {
    const r = {};
    classStudents.forEach(s => { r[s.id] = status; });
    setRecords(r);
    setSaved(false);
  };

  const handleSave = () => {
    saveAttendance(selectedDate, selectedSubject, records);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fade-up">
      <div className="stats-grid">
        {[
          { label: 'Present', value: stats.present, color: '#16a34a' },
          { label: 'Absent',  value: stats.absent,  color: '#dc2626' },
          { label: 'Late',    value: stats.late,    color: '#d97706' },
          { label: 'Excused', value: stats.excused, color: '#7c3aed' },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-sub">{stats.total ? Math.round(c.value / stats.total * 100) : 0}% of class</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title"><i className="ti ti-clipboard-check" />Mark Attendance</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => markAll('present')}>All Present</button>
            <button className="btn btn-outline btn-sm" onClick={() => markAll('absent')}>All Absent</button>
          </div>
        </div>

        <div className="controls-bar">
          <select className="form-control form-select" style={{ width: 140 }} value={selectedClass} onChange={e => handleClassChange(e.target.value)}>
            {availableClasses.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-control form-select" style={{ width: 150 }} value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSaved(false); }}>
            {availableSubjects.map(s => <option key={s}>{s}</option>)}
          </select>
          <input type="date" className="form-control" style={{ width: 160 }} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSaved(false); }} />
          <div className="search-wrap" style={{ flex: 1 }}>
            <i className="ti ti-search search-icon" />
            <input className="form-control" placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Student</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const ac = getAvatarColor(i);
                return (
                  <tr key={s.id}>
                    <td style={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>
                    <td>
                      <div className="student-info">
                        <div className="avatar" style={{ background: ac.bg, color: ac.color }}>{initials(s.name)}</div>
                        <div>
                          <div className="student-name">{s.name}</div>
                          <div className="student-meta">{s.id} · {s.gender === 'F' ? 'Female' : 'Male'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusToggle
                        value={records[s.id] || 'present'}
                        onChange={v => { setRecords(r => ({ ...r, [s.id]: v })); setSaved(false); }}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        style={{ padding: '5px 10px', fontSize: 12.5, width: 160 }}
                        placeholder="Add note…"
                        value={notes[s.id] || ''}
                        onChange={e => setNotes(n => ({ ...n, [s.id]: e.target.value }))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="save-bar">
          {saved ? (
            <div className="toast-success">
              <i className="ti ti-circle-check" style={{ fontSize: 18 }} />
              Attendance saved for {selectedClass} · {selectedSubject}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {classStudents.length} students · {selectedClass} · {selectedSubject} · {selectedDate}
            </div>
          )}
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="ti ti-device-floppy" style={{ fontSize: 15 }} />
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
