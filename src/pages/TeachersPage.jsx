import React, { useState } from 'react';
import { USERS, getAvatarColor, initials } from '../data/mockData.js';

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const teachers = USERS.filter(u => u.role === 'teacher');
  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-up">
      <div className="stats-grid stats-grid-3" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total Teachers', value: teachers.length, color: '#2563eb', icon: 'ti-chalkboard' },
          { label: 'Classes Covered', value: [...new Set(teachers.flatMap(t => t.classes || []))].length, color: '#7c3aed', icon: 'ti-layout-dashboard' },
          { label: 'Subjects Taught', value: [...new Set(teachers.flatMap(t => t.subjects || []))].length, color: '#16a34a', icon: 'ti-book' },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="stat-label">
              <span className="stat-icon" style={{ background: c.color + '18' }}>
                <i className={`ti ${c.icon}`} style={{ fontSize: 15, color: c.color }} />
              </span>
              {c.label}
            </div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title"><i className="ti ti-chalkboard" />Teaching Staff</span>
          <button className="btn btn-primary btn-sm">
            <i className="ti ti-user-plus" />Add Teacher
          </button>
        </div>

        <div className="controls-bar">
          <div className="search-wrap" style={{ flex: 1 }}>
            <i className="ti ti-search search-icon" />
            <input className="form-control" placeholder="Search teachers…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Teacher</th>
                <th>Classes</th>
                <th>Subjects</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const ac = getAvatarColor(i + 2);
                return (
                  <tr key={t.id}>
                    <td style={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>
                    <td>
                      <div className="student-info">
                        <div className="avatar" style={{ background: ac.bg, color: ac.color }}>{initials(t.name)}</div>
                        <div>
                          <div className="student-name">{t.name}</div>
                          <div className="student-meta">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {(t.classes || []).map(c => (
                          <span key={c} style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>{c}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {(t.subjects || []).map(s => (
                          <span key={s} style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td><span className="badge badge-teacher">Teacher</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-xs"><i className="ti ti-eye" /></button>
                        <button className="btn btn-outline btn-xs"><i className="ti ti-edit" /></button>
                        <button className="btn btn-danger btn-xs"><i className="ti ti-trash" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
