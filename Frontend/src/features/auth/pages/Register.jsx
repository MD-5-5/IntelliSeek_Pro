import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSelector } from 'react-redux'

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { handleRegister } = useAuth()
    const navigate = useNavigate()
    const loading = useSelector((state) => state.auth.loading)
    const error = useSelector((state) => state.auth.error)

    const submitForm = async (event) => {
        event.preventDefault()
        const result = await handleRegister({ username, email, password })

        if (result.success) {
            navigate('/login', {
                replace: true,
                state: {
                    message: `Account created successfully! You can now sign in.`,
                },
            })
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                html, body { overflow: hidden; height: 100%; }
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes gridFloat {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-6px); }
                }
                @keyframes orb1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50%      { transform: translate(20px, -30px) scale(1.05); }
                }
                @keyframes orb2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50%      { transform: translate(-15px, 20px) scale(1.04); }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50%      { opacity: 1;   transform: scale(1.25); }
                }

                .reg-page {
                    font-family: 'Inter', -apple-system, sans-serif;
                    min-height: 100dvh;
                    background: #07090f;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px 16px;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Ambient orbs ── */
                .reg-orb {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(70px);
                }
                .reg-orb-1 {
                    width: 480px; height: 480px;
                    top: -120px; right: -80px;
                    background: radial-gradient(circle, rgba(32,184,205,0.18) 0%, transparent 70%);
                    animation: orb1 9s ease-in-out infinite;
                }
                .reg-orb-2 {
                    width: 420px; height: 420px;
                    bottom: -100px; left: -60px;
                    background: radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%);
                    animation: orb2 11s ease-in-out infinite;
                }

                /* ── Grid dots background ── */
                .reg-grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);
                    background-size: 32px 32px;
                    pointer-events: none;
                    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
                    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
                }

                /* ── Outer wrapper ── */
                .reg-shell {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 920px;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0;
                    animation: fadeUp 0.4s ease forwards;
                }

                @media (min-width: 860px) {
                    .reg-shell {
                        grid-template-columns: 1fr 1fr;
                        border-radius: 28px;
                        overflow: hidden;
                        border: 1px solid rgba(255,255,255,0.08);
                        box-shadow: 0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(32,184,205,0.04);
                    }
                }

                /* ── Left panel (branding) ── */
                .reg-left {
                    display: none;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 44px 40px;
                    background: linear-gradient(145deg, #0c1020 0%, #080c17 100%);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    position: relative;
                    overflow: hidden;
                }

                @media (min-width: 860px) {
                    .reg-left { display: flex; }
                }

                .reg-left-grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(32,184,205,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(32,184,205,0.04) 1px, transparent 1px);
                    background-size: 40px 40px;
                    pointer-events: none;
                    animation: gridFloat 8s ease-in-out infinite;
                }

                .reg-brand-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    position: relative;
                }

                .reg-brand-icon {
                    height: 44px; width: 44px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #20b8cd, #0ea5e9);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 28px rgba(32,184,205,0.45), 0 0 60px rgba(32,184,205,0.12);
                }

                .reg-brand-name {
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.4px;
                    background: linear-gradient(90deg, #fff 30%, rgba(32,184,205,0.8) 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                }

                .reg-hero-text {
                    position: relative;
                }

                .reg-hero-text h2 {
                    font-size: clamp(26px, 3vw, 36px);
                    font-weight: 700;
                    line-height: 1.2;
                    letter-spacing: -0.6px;
                    color: white;
                    margin-bottom: 16px;
                }

                .reg-hero-text p {
                    font-size: 14px;
                    line-height: 1.75;
                    color: #6b7280;
                    max-width: 300px;
                }

                .reg-features {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    position: relative;
                }

                .reg-feature-pill {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 11px 14px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    font-size: 13px;
                    color: #9ca3af;
                    backdrop-filter: blur(8px);
                    transition: border-color 0.2s;
                }
                .reg-feature-pill:hover {
                    border-color: rgba(32,184,205,0.2);
                }

                .reg-feature-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #20b8cd;
                    flex-shrink: 0;
                    box-shadow: 0 0 6px rgba(32,184,205,0.7);
                    animation: pulse 2.5s ease-in-out infinite;
                }

                /* ── Right panel (form) ── */
                .reg-right {
                    background: #0d1120;
                    padding: 40px 36px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                @media (max-width: 859px) {
                    .reg-right {
                        border-radius: 24px;
                        border: 1px solid rgba(255,255,255,0.08);
                        box-shadow: 0 30px 80px rgba(0,0,0,0.5);
                        padding: 32px 24px;
                    }
                }

                @media (max-width: 400px) {
                    .reg-right { padding: 28px 20px; }
                }

                /* Mobile brand (shown only on small screens) */
                .reg-mobile-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 28px;
                }
                @media (min-width: 860px) {
                    .reg-mobile-brand { display: none; }
                }

                .reg-eyebrow {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(32,184,205,0.65);
                    margin-bottom: 10px;
                }

                .reg-title {
                    font-size: clamp(22px, 4vw, 28px);
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    color: white;
                    margin-bottom: 6px;
                }

                .reg-subtitle {
                    font-size: 13.5px;
                    line-height: 1.65;
                    color: #4b5563;
                    margin-bottom: 24px;
                }

                .reg-notice {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 12px 14px;
                    border-radius: 12px;
                    background: rgba(32,184,205,0.06);
                    border: 1px solid rgba(32,184,205,0.14);
                    font-size: 13px;
                    color: rgba(32,184,205,0.85);
                    line-height: 1.55;
                    margin-bottom: 20px;
                }

                .reg-notice-icon {
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .reg-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 12px 14px;
                    border-radius: 12px;
                    background: rgba(248,113,113,0.08);
                    border: 1px solid rgba(248,113,113,0.18);
                    font-size: 13px;
                    color: #fca5a5;
                    line-height: 1.55;
                    margin-bottom: 20px;
                }

                /* ── Form fields ── */
                .reg-form { display: flex; flex-direction: column; gap: 16px; }

                .reg-field { display: flex; flex-direction: column; gap: 6px; }

                .reg-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #9ca3af;
                    letter-spacing: 0.01em;
                }

                .reg-input-wrap { position: relative; }

                .reg-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #374151;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                }

                .reg-input {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 11px 14px 11px 40px;
                    color: #f3f4f6;
                    font-size: 14px;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                }
                .reg-input::placeholder { color: #374151; }
                .reg-input:focus {
                    border-color: rgba(32,184,205,0.5);
                    box-shadow: 0 0 0 3px rgba(32,184,205,0.1);
                    background: rgba(32,184,205,0.03);
                }

                .reg-pw-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #4b5563;
                    display: flex;
                    align-items: center;
                    padding: 4px;
                    border-radius: 6px;
                    transition: color 0.15s;
                }
                .reg-pw-toggle:hover { color: #9ca3af; }

                /* ── Submit button ── */
                .reg-submit {
                    width: 100%;
                    padding: 12px 20px;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #20b8cd 0%, #0ea5e9 100%);
                    color: #07090f;
                    font-size: 14px;
                    font-weight: 700;
                    font-family: inherit;
                    letter-spacing: 0.01em;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 20px rgba(14,165,233,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 4px;
                }
                .reg-submit:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 26px rgba(14,165,233,0.48);
                    filter: brightness(1.06);
                }
                .reg-submit:active:not(:disabled) { transform: translateY(0); }
                .reg-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .reg-spinner {
                    width: 14px; height: 14px;
                    border: 2px solid rgba(7,9,15,0.35);
                    border-top-color: #07090f;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── Divider / Footer ── */
                .reg-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 4px 0;
                }
                .reg-divider-line {
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.06);
                }
                .reg-divider-text {
                    font-size: 12px;
                    color: #374151;
                }

                .reg-footer {
                    text-align: center;
                    font-size: 13.5px;
                    color: #4b5563;
                    margin-top: 4px;
                }
                .reg-footer a {
                    color: #22d3ee;
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .reg-footer a:hover { color: #67e8f9; }
            `}</style>

            <div className="reg-page">
                <div className="reg-orb reg-orb-1" />
                <div className="reg-orb reg-orb-2" />
                <div className="reg-grid" />

                <div className="reg-shell">

                    {/* ── Left branding panel (desktop only) ── */}
                    <div className="reg-left">
                        <div className="reg-left-grid" />

                        <div className="reg-brand-logo">
                            <div className="reg-brand-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.2"/>
                                    <path d="m21 21-4.35-4.35" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <span className="reg-brand-name">IntelliSeek</span>
                        </div>

                        <div className="reg-hero-text">
                            <h2>Your answers,<br/>beautifully surfaced.</h2>
                            <p>Create your workspace once, verify your email, and step into a focused dark environment built for deep research.</p>
                        </div>

                        <div className="reg-features">
                            <div className="reg-feature-pill">
                                <div className="reg-feature-dot" style={{ animationDelay: '0.4s' }} />
                                Dark panels and cyan accents — consistent from sign-up to dashboard.
                            </div>
                            <div className="reg-feature-pill">
                                <div className="reg-feature-dot" style={{ animationDelay: '0.8s' }} />
                                One account, full conversation history across sessions.
                            </div>
                        </div>
                    </div>

                    {/* ── Right form panel ── */}
                    <div className="reg-right">

                        {/* Mobile-only brand header */}
                        <div className="reg-mobile-brand">
                            <div className="reg-brand-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.3"/>
                                    <path d="m21 21-4.35-4.35" stroke="white" strokeWidth="2.3" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <span style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.3px', color: 'white' }}>IntelliSeek</span>
                        </div>

                        <p className="reg-eyebrow">Get Started</p>
                        <h1 className="reg-title">Create your account</h1>
                        <p className="reg-subtitle">Sign up below and start using IntelliSeek instantly.</p>

                        {error && (
                            <div className="reg-error">
                                <svg style={{ flexShrink: 0, marginTop: '1px' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={submitForm} className="reg-form">
                            {/* Username */}
                            <div className="reg-field">
                                <label htmlFor="username" className="reg-label">Username</label>
                                <div className="reg-input-wrap">
                                    <span className="reg-input-icon">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                    </span>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        required
                                        className="reg-input"
                                    />
                                </div>
                            </div>

                            {/* Gmail */}
                            <div className="reg-field">
                                <label htmlFor="email" className="reg-label">Gmail</label>
                                <div className="reg-input-wrap">
                                    <span className="reg-input-icon">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                        </svg>
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@gmail.com"
                                        required
                                        className="reg-input"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="reg-field">
                                <label htmlFor="password" className="reg-label">Password</label>
                                <div className="reg-input-wrap">
                                    <span className="reg-input-icon">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a strong password"
                                        required
                                        className="reg-input"
                                        style={{ paddingRight: '42px' }}
                                    />
                                    <button
                                        type="button"
                                        className="reg-pw-toggle"
                                        onClick={() => setShowPassword(v => !v)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        ) : (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="reg-submit">
                                {loading ? (
                                    <>
                                        <div className="reg-spinner" />
                                        Creating account…
                                    </>
                                ) : (
                                    <>
                                        Register
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="reg-divider" style={{ marginTop: '20px' }}>
                            <div className="reg-divider-line" />
                            <span className="reg-divider-text">or</span>
                            <div className="reg-divider-line" />
                        </div>

                        <p className="reg-footer" style={{ marginTop: '16px' }}>
                            Already have an account?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Register