import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO_CREDENTIALS = [
  { role: 'admin',   email: 'admin@attendtrack.cm',   password: 'admin123',   label: 'Admin',   icon: 'ti-shield-check', color: '#dc2626' },
  { role: 'teacher', email: 'mbida@attendtrack.cm',   password: 'teacher123', label: 'Teacher', icon: 'ti-chalkboard', color: '#2563eb' },
  { role: 'student', email: 'amara@student.cm',       password: 'student123', label: 'Student', icon: 'ti-school', color: '#16a34a' },
];

export default function LoginPage() {
  const { login, loginError, loading } = useAuth();
  const [role, setRole] = useState('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const fillDemo = (cred) => {
    setRole(cred.role);
    setEmail(cred.email);
    setPassword(cred.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password, role);
  };

  const selectedRole = DEMO_CREDENTIALS.find(c => c.role === role);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1b2d 0%, #1e2d42 50%, #162032 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: -120, right: -120, width: 500, height: 500,
        borderRadius: '50%', background: 'rgba(37,99,235,0.06)', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: -80, left: -80, width: 360, height: 360,
        borderRadius: '50%', background: 'rgba(37,99,235,0.04)', pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #2564ebcd, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 24px rgba(37,99,235,0.2)',
          }}>
            <i className="ti ti-school" style={{ fontSize: 26, color: '#fff' }} />
          </div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 1000, letterSpacing: -0.5 }}>A.Record</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, marginTop: 5 }}>School Management System</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 20 + "px", padding: '32px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Sign in to your account</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Select your role and enter your credentials</p>

          {/* Role Selector */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
              I am a...
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {DEMO_CREDENTIALS.map(c => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => setRole(c.role)}
                  style={{
                    padding: '11px 8px',
                    border: role === c.role ? `2px solid ${c.color}` : '2px solid #e2e8f0',
                    borderRadius: 10, cursor: 'pointer',
                    background: role === c.role ? `${c.color}0d` : '#fff',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s', fontFamily: 'Sora, sans-serif',
                  }}
                >
                  <i className={`ti ${c.icon}`} style={{ fontSize: 20, color: role === c.role ? c.color : '#94a3b8' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: role === c.role ? c.color : '#64748b' }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-mail" style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: '#94a3b8', fontSize: 17, pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-lock" style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: '#94a3b8', fontSize: 17, pointerEvents: 'none',
                }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                }}>
                  <i className={`ti ${showPw ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 17 }} />
                </button>
              </div>
            </div>

            {loginError && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9,
                padding: '10px 14px', marginBottom: 16, fontSize: 13,
                color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="ti ti-alert-circle" style={{ fontSize: 16, flexShrink: 0 }} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, marginBottom: 16 }}
            >
              {loading ? (
                <>
                  <i className="ti ti-loader spinner" style={{ fontSize: 16 }} />
                  Signing in...
                </>
              ) : (
                <>
                  <i className="ti ti-login" style={{ fontSize: 16 }} />
                  Sign In as {selectedRole?.label}
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, textAlign: 'center' }}>
              Quick demo — click to fill credentials:
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DEMO_CREDENTIALS.map(c => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => fillDemo(c)}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: 8,
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    cursor: 'pointer', font: '600 12px Sora, sans-serif',
                    color: c.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 5, transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  <i className={`ti ${c.icon}`} style={{ fontSize: 13 }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 24 }}>
          © 2025 A.Record· School Management System
        </p>
      </div>
    </div>
  );
}
