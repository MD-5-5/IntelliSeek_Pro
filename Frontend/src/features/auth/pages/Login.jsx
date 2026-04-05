import React, { useMemo, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useSelector } from 'react-redux'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)
  const location = useLocation()

  const { handleLogin } = useAuth()

  const registrationMessage = useMemo(
    () => location.state?.message || null,
    [location.state]
  )

  const submitForm = async (event) => {
    event.preventDefault()
    await handleLogin({ email, password })
  }

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          font-family: 'Sora', -apple-system, sans-serif;
          min-height: 100dvh;
          background: #050810;
          color: white;
          display: flex;
          align-items: stretch;
          position: relative;
          overflow: hidden;
        }
        .blob-1 {
          position: fixed; pointer-events: none; z-index: 0;
          top: -200px; left: -200px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
          animation: driftA 14s ease-in-out infinite alternate;
        }
        .blob-2 {
          position: fixed; pointer-events: none; z-index: 0;
          bottom: -180px; right: -180px;
          width: 520px; height: 520px; border-radius: 50%;
          background: radial-gradient(circle, rgba(14,165,233,0.09) 0%, transparent 70%);
          animation: driftB 18s ease-in-out infinite alternate;
        }
        @keyframes driftA { from{transform:translate(0,0)} to{transform:translate(40px,30px)} }
        @keyframes driftB { from{transform:translate(0,0)} to{transform:translate(-30px,-40px)} }
        .grid-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px);
          background-size: 52px 52px;
        }
        .left-panel {
          display: none;
          position: relative; z-index: 1;
          flex: 0 0 460px;
          padding: 52px 48px;
          border-right: 1px solid rgba(255,255,255,0.04);
          flex-direction: column;
          justify-content: space-between;
          background: rgba(255,255,255,0.01);
        }
        @media (min-width: 1024px) { .left-panel { display: flex; } }
        .logo-row { display: flex; align-items: center; gap: 12px; }
        .logo-icon {
          width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
          background: linear-gradient(135deg, #06b6d4, #0ea5e9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 26px rgba(6,182,212,0.38), 0 0 56px rgba(6,182,212,0.1);
        }
        .logo-name { font-size: 17px; font-weight: 600; letter-spacing: -0.4px; }
        .logo-tagline { font-size: 11.5px; color: #4b5563; margin-top: 2px; }
        .panel-headline {
          font-size: 40px; font-weight: 700; line-height: 1.2;
          letter-spacing: -1.2px; color: white;
        }
        .panel-headline em { font-style: normal; color: #06b6d4; }
        .panel-sub { font-size: 14px; color: #6b7280; line-height: 1.78; margin-top: 16px; max-width: 340px; }
        .feat-cards { display: flex; flex-direction: column; gap: 10px; }
        .feat-card {
          border: 1px solid rgba(255,255,255,0.055); background: rgba(255,255,255,0.022);
          border-radius: 15px; padding: 14px 16px;
          display: flex; gap: 13px; align-items: flex-start;
          backdrop-filter: blur(6px); transition: border-color 0.2s;
        }
        .feat-card:hover { border-color: rgba(6,182,212,0.18); }
        .feat-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: rgba(6,182,212,0.09); border: 1px solid rgba(6,182,212,0.16);
          display: flex; align-items: center; justify-content: center;
        }
        .feat-title { font-size: 12.5px; font-weight: 600; color: #e5e7eb; margin-bottom: 2px; }
        .feat-desc { font-size: 11.5px; color: #6b7280; line-height: 1.6; }
        .panel-footer { font-size: 11px; color: #2d3748; }

        /* Right */
        .right-area {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px 20px; position: relative; z-index: 1;
        }
        .form-card {
          width: 100%; max-width: 416px;
          background: rgba(13,17,32,0.88);
          border: 1px solid rgba(255,255,255,0.075);
          border-radius: 26px; padding: 38px 34px;
          box-shadow: 0 28px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.028);
          backdrop-filter: blur(24px);
          animation: cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(18px) scale(0.985); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .mobile-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        @media (min-width: 1024px) { .mobile-logo { display: none; } }
        .eyebrow {
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: #06b6d4;
          display: flex; align-items: center; gap: 8px;
        }
        .eyebrow::before {
          content: ''; width: 18px; height: 1.5px;
          background: currentColor; border-radius: 2px; display: block;
        }
        .form-title { font-size: 27px; font-weight: 700; letter-spacing: -0.6px; margin-top: 9px; }
        .form-sub { font-size: 13.5px; color: #6b7280; margin-top: 7px; line-height: 1.65; }
        .alert-info {
          margin-top: 18px; padding: 12px 15px; border-radius: 13px;
          border: 1px solid rgba(6,182,212,0.18); background: rgba(6,182,212,0.07);
          font-size: 12.5px; color: #a5f3fc; line-height: 1.6;
          display: flex; gap: 9px; align-items: flex-start;
        }
        .alert-error {
          margin-top: 14px; padding: 12px 15px; border-radius: 13px;
          border: 1px solid rgba(248,113,113,0.18); background: rgba(127,29,29,0.16);
          font-size: 12.5px; color: #fca5a5; line-height: 1.6;
          display: flex; gap: 9px; align-items: flex-start;
        }
        .fields { margin-top: 26px; display: flex; flex-direction: column; gap: 16px; }
        .field-label { display: block; font-size: 12.5px; font-weight: 500; color: #9ca3af; margin-bottom: 7px; }
        .field-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #374151; pointer-events: none; display: flex;
          transition: color 0.18s;
        }
        .field-wrap:focus-within .field-icon { color: #06b6d4; }
        .auth-input {
          width: 100%; border-radius: 13px;
          border: 1px solid rgba(255,255,255,0.075);
          background: rgba(8,12,24,0.65);
          padding: 12px 14px 12px 42px;
          color: #f3f4f6; font-size: 14px; font-family: 'Sora', sans-serif;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input::placeholder { color: #2d3748; }
        .auth-input:focus {
          border-color: rgba(6,182,212,0.45);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.09);
        }
        .submit-btn {
          margin-top: 24px; width: 100%; padding: 13px;
          border-radius: 13px; border: none;
          background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%);
          color: #030609; font-size: 14.5px; font-weight: 700;
          font-family: 'Sora', sans-serif; letter-spacing: -0.15px;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 22px rgba(6,182,212,0.32);
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .submit-btn::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(255,255,255,0.14), transparent);
          opacity:0; transition:opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 12px 30px rgba(6,182,212,0.42); }
        .submit-btn:hover:not(:disabled)::after { opacity:1; }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .spin { width:15px; height:15px; border-radius:50%; border:2px solid rgba(3,6,9,0.25); border-top-color:#030609; animation:spin 0.7s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .auth-footer { margin-top:22px; text-align:center; font-size:13px; color:#6b7280; }
        .auth-link { color:#06b6d4; font-weight:600; text-decoration:none; transition:color 0.15s; }
        .auth-link:hover { color:#67e8f9; }
      `}</style>

      <div className="auth-root">
        <div className="blob-1" /><div className="blob-2" />
        <div className="grid-overlay" />

        {/* Left panel */}
        <div className="left-panel">
          <div className="logo-row">
            <div className="logo-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.2"/>
                <path d="m21 21-4.35-4.35" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="logo-name">IntelliSeek</div>
              <div className="logo-tagline">Search-grade answers, clean chat flow.</div>
            </div>
          </div>

          <div>
            <p className="panel-headline">Pick up right<br />where you<br /><em>left off.</em></p>
            <p className="panel-sub">Your conversations, history, and workspace are exactly as you left them. Sign in and keep exploring.</p>
          </div>

          <div className="feat-cards">
            {[
              {
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                title: 'Persistent conversations',
                desc: 'Your full chat history syncs across every session.',
              },
              {
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                title: 'Real-time streaming answers',
                desc: 'Animated markdown responses that feel alive and immediate.',
              },
            ].map((f, i) => (
              <div className="feat-card" key={i}>
                <div className="feat-icon">{f.icon}</div>
                <div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel-footer">© 2025 IntelliSeek · Privacy · Terms</div>
        </div>

        {/* Form */}
        <div className="right-area">
          <div className="form-card">
            <div className="mobile-logo">
              <div className="logo-icon" style={{ width: 36, height: 36, borderRadius: 11 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.2"/>
                  <path d="m21 21-4.35-4.35" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="logo-name">IntelliSeek</div>
            </div>

            <div className="eyebrow">Welcome back</div>
            <h1 className="form-title">Sign in</h1>
            <p className="form-sub">Welcome back. Sign in to continue.</p>

            {registrationMessage && (
              <div className="alert-info">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                {registrationMessage}
              </div>
            )}
            {error && (
              <div className="alert-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={submitForm}>
              <div className="fields">
                <div>
                  <label htmlFor="email" className="field-label">Email address</label>
                  <div className="field-wrap">
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@gmail.com" required className="auth-input" />
                    <span className="field-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="field-label">Password</label>
                  <div className="field-wrap">
                    <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password" required className="auth-input" />
                    <span className="field-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <><div className="spin" />Signing in…</> : <>Sign in <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
              </button>
            </form>

            <p className="auth-footer">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="auth-link">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login