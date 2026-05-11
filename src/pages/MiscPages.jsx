import React from 'react';

export function SettingsPage() {
  return (
    <div className="fade-up">
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title"><i className="ti ti-settings" />System Settings</span>
        </div>
        <div className="panel-body">
          {[
            { label: 'School Name', value: 'Yaounde International Business School', icon: 'ti-building' },
            { label: 'Academic Year', value: '2025 – 2026', icon: 'ti-calendar' },
            { label: 'School Email', value: 'info@ghs-yaounde.cm', icon: 'ti-mail' },
            { label: 'Phone Number', value: '+237-652-320-524', icon: 'ti-phone' },
            { label: 'Region', value: 'Centre Region, Cameroon', icon: 'ti-map-pin' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${s.icon}`} style={{ color: '#2563eb', fontSize: 17 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 1 }}>{s.value}</div>
                </div>
              </div>
              <button className="btn btn-outline btn-sm"><i className="ti ti-edit" />Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimetablePage() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const periods = ['7:30–8:30', '8:30–9:30', '9:30–10:30', '10:30–11:30', '12:00–13:00', '13:00–14:00'];
  const subjects = ['Mathematics', 'English', 'Science', 'History', 'ICT', 'French'];
  const colors = ['#dbeafe', '#dcfce7', '#ede9fe', '#fef3c7', '#e0f2fe', '#fce7f3'];
  const textColors = ['#1d4ed8', '#15803d', '#7c3aed', '#b45309', '#0369a1', '#be185d'];

  return (
    <div className="fade-up">
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title"><i className="ti ti-calendar" />Weekly Timetable</span>
        </div>
        <div style={{ overflowX: 'auto', padding: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 700, background: '#f8fafc', borderRadius: '8px 0 0 8px', width: 100 }}>Period</th>
                {days.map(d => (
                  <th key={d} style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, color: '#0f172a', fontWeight: 700, background: '#f8fafc' }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, pi) => (
                <tr key={pi}>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{period}</td>
                  {days.map((day, di) => {
                    const subIdx = (pi + di) % subjects.length;
                    const sub = subjects[subIdx];
                    return (
                      <td key={di} style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ background: colors[subIdx], color: textColors[subIdx], borderRadius: 8, padding: '8px 10px', textAlign: 'center', fontSize: 12.5, fontWeight: 600 }}>
                          {sub}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
