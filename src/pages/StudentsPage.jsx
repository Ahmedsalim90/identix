import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { STUDENTS, CLASSES, ATTENDANCE_HISTORY, getAvatarColor, initials } from '../data/mockData.js';

export default function StudentsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [];
  });

  const myClasses = user?.role === 'admin' ? CLASSES : (user?.classes || []);
  const allDates = Object.keys(ATTENDANCE_HISTORY).sort().reverse().slice(0, 20);

  const studentsWithStats = useMemo(() => {
    const base = user?.role === 'teacher'
      ? STUDENTS.filter(s => myClasses.includes(s.class))
      : STUDENTS;
    return base.map(s => {
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
  }, [user, myClasses, allDates]);

  const filtered = useMemo(() => {
    let list = studentsWithStats;
    if (filterClass !== 'All') list = list.filter(s => s.class === filterClass);
    if (search) list = list.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'rate') list = [...list].sort((a, b) => a.rate - b.rate);
    if (sortBy === 'class') list = [...list].sort((a, b) => a.class.localeCompare(b.class));
    return list;
  }, [studentsWithStats, filterClass, search, sortBy]);

  const classList = user?.role === 'admin' ? ['All', ...CLASSES] : ['All', ...myClasses];

  {/*_________________a function to handle the state of the input function_______________ */}
          
          const  handleSaveStudent = (newStudent) => {
            const updatedList = [...students, {...newStudent, id: Date.now()}];
            setStudents(updatedList);
            localStorage.setItem('students', JSON.stringify(updatedList));
            setShowForm(false);
            
          }

          {/*___________________Designation of the form for student records________________________ */}
          (
            showForm &&(
              <div className = "modal-overlay">
                <form onSubmit = { handleSaveStudent }>
                  <input name = "email" type = "email" placeholder = " Studentemail@gmail.cm " required  />
                  <input name = "dob" type = "date" required />
                  <input name = "FormalSchool" placeholder = " Most recent high school " required />
                  <button type = "submit" >Save student</button>
                  <button type = "button" onclick = {() => setShowForm(false)} >Cancel</button>
                </form>
              </div>
            )
          )

  return (
    <div className="fade-up">
      <div className="stats-grid">
        {[
          { label: 'Total Students', value: studentsWithStats.length, color: '#2563eb', icon: 'ti-users' },
          { label: 'Above 85%', value: studentsWithStats.filter(s => s.rate >= 85).length, color: '#16a34a', icon: 'ti-circle-check' },
          { label: 'Watch (70–84%)', value: studentsWithStats.filter(s => s.rate >= 70 && s.rate < 85).length, color: '#d97706', icon: 'ti-alert-triangle' },
          { label: 'At Risk (<70%)', value: studentsWithStats.filter(s => s.rate < 70).length, color: '#dc2626', icon: 'ti-circle-x' },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="stat-label">
              <span className="stat-icon" style={{ background: c.color + '18' }}>
                <i className={`ti ${c.icon}`} style={{ fontSize: 15, color: c.color }} />
              </span>
              {c.label}
            </div>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title"><i className="ti ti-users" />Student Roster</span>
          {user?.role === 'admin' && (
            <button className="btn btn-primary btn-sm"
             onclick = {
              () => setShowForm(true)
             }
            >
              <i className="ti ti-user-plus" />Add Student
            </button>
          )}
        </div>

        <div className="controls-bar">
          <div className="search-wrap" style={{ flex: 1 }}>
            <i className="ti ti-search search-icon" />
            <input className="form-control" placeholder="Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control form-select" style={{ width: 140 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            {classList.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-control form-select" style={{ width: 140 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="rate">Sort: Rate ↑</option>
            <option value="class">Sort: Class</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Rate</th>
                <th>Status</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const ac = getAvatarColor(i);
                const risk = s.rate >= 85 ? 'good' : s.rate >= 70 ? 'watch' : 'risk';
                const riskLabel = s.rate >= 85 ? 'Good' : s.rate >= 70 ? 'Watch' : 'At Risk';
                return (
                  <tr key={s.id}>
                    <td style={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>
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
                    <td style={{ fontSize: 13, color: '#64748b' }}>{s.gender === 'F' ? 'Female' : 'Male'}</td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>{s.present}</td>
                    <td style={{ color: '#dc2626', fontWeight: 600 }}>{s.absent}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${s.rate}%`, height: '100%', background: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: s.rate >= 85 ? '#16a34a' : s.rate >= 70 ? '#d97706' : '#dc2626' }}>{s.rate}%</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${risk}`}>{riskLabel}</span></td>
                    {user?.role === 'admin' && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-xs"><i className="ti ti-eye" /></button>
                          <button className="btn btn-outline btn-xs"><i className="ti ti-edit" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: 12.5, color: '#64748b' }}>
          Showing {filtered.length} of {studentsWithStats.length} students
        </div>
      </div>
    </div>
  );
}
