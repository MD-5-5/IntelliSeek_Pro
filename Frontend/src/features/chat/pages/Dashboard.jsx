import React, { useEffect, useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { logout } from '../../auth/auth.slice'
import { useChat } from '../hooks/useChat'
import { setNeuroVaultUserId } from '../chat.slice'
import remarkGfm from 'remark-gfm'

// UTILITY

const cleanText = (text) => {
  if (!text) return ''
  return text.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim()
}

//ANIMATED PLACEHOLDER
const PLACEHOLDER_TOPICS = [
  'Ask about geopolitics...',
  'Ask about AI & the future...',
  'Ask about science & space...',
  'Ask about history & culture...',
  'Ask about health & medicine...',
  'Ask about finance & markets...',
  'Ask about coding & tech...',
  'Ask about climate & environment...',
]

const AnimatedPlaceholder = () => {
  const [topicIndex, setTopicIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState('typing')
  const charRef = useRef(0)

  useEffect(() => {
    charRef.current = 0
    setDisplayed('')
    setPhase('typing')
  }, [topicIndex])

  useEffect(() => {
    const topic = PLACEHOLDER_TOPICS[topicIndex]

    if (phase === 'typing') {
      const iv = setInterval(() => {
        charRef.current++
        setDisplayed(topic.slice(0, charRef.current))
        if (charRef.current >= topic.length) { clearInterval(iv); setPhase('pause') }
      }, 40)
      return () => clearInterval(iv)
    }
    if (phase === 'pause') {
      const t = setTimeout(() => setPhase('erasing'), 1800)
      return () => clearTimeout(t)
    }
    if (phase === 'erasing') {
      const iv = setInterval(() => {
        charRef.current--
        setDisplayed(topic.slice(0, charRef.current))
        if (charRef.current <= 0) { clearInterval(iv); setTopicIndex(i => (i + 1) % PLACEHOLDER_TOPICS.length) }
      }, 22)
      return () => clearInterval(iv)
    }
  }, [phase, topicIndex])

  return (
    <span style={{ color: '#64748b', fontSize: '15px', pointerEvents: 'none', userSelect: 'none' }}>
      {displayed}
      <span style={{
        display: 'inline-block', width: '2px', height: '14px',
        background: '#20b8cd', borderRadius: '1px', marginLeft: '1px',
        verticalAlign: 'middle', animation: 'blink 0.8s step-end infinite'
      }} />
    </span>
  )
}

const getTypingStep = (text, index) => {
  const currentChar = text[index] || ''
  const nextChar = text[index + 1] || ''

  if (currentChar === '\n' && nextChar === '\n') {
    return { count: 2, delay: 120 }
  }

  if (/[.!?]/.test(currentChar)) {
    return { count: 1, delay: 95 }
  }

  if (/[,;:]/.test(currentChar)) {
    return { count: 1, delay: 65 }
  }

  if (currentChar === '\n') {
    return { count: 1, delay: 45 }
  }

  if (currentChar === ' ') {
    return { count: 1, delay: 18 }
  }

  if (currentChar === '`') {
    return { count: 1, delay: 12 }
  }

  return { count: Math.min(3, text.length - index), delay: 14 }
}

// TYPING ANIMATION
const TypingText = ({ content, onComplete }) => {
  const [shown, setShown] = useState('')
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const full = content || ''
    if (!full) {
      setFinished(true)
      onComplete?.()
      return
    }

    let index = 0
    let timeoutId
    let cancelled = false

    const typeNext = () => {
      if (cancelled) return

      const { count, delay } = getTypingStep(full, index)
      index = Math.min(index + count, full.length)
      setShown(full.slice(0, index))

      if (index >= full.length) {
        setFinished(true)
        onComplete?.()
        return
      }

      timeoutId = setTimeout(typeNext, delay)
    }

    timeoutId = setTimeout(typeNext, 40)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [content, onComplete])

  return (
    <div style={{ position: 'relative' }}>
      <ReactMarkdown components={buildMdComponents()} remarkPlugins={[remarkGfm]}>
        {shown}
      </ReactMarkdown>
      {!finished && (
        <span style={{
          display: 'inline-block', height: '16px', width: '2px', borderRadius: '2px',
          background: '#20b8cd', marginLeft: '2px', verticalAlign: 'middle',
          boxShadow: '0 0 10px rgba(32,184,205,0.55)',
          animation: 'blink 0.8s step-end infinite'
        }} />
      )}
    </div>
  )
}

// STATIC MARKDOWN 
const StaticMarkdown = ({ content }) => (
  <ReactMarkdown components={buildMdComponents()} remarkPlugins={[remarkGfm]}>
    {cleanText(content)}
  </ReactMarkdown>
)

function buildMdComponents() {
  return {
    p: ({ children }) => (
      <p style={{ marginBottom: '10px', lineHeight: '1.75', fontSize: '15px', color: '#d1d5db' }}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul style={{ marginBottom: '10px', paddingLeft: '4px', listStyle: 'none' }}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol style={{ marginBottom: '10px', paddingLeft: '16px' }}>{children}</ol>
    ),
    li: ({ children }) => (
      <li style={{ display: 'flex', gap: '8px', fontSize: '15px', color: '#d1d5db', lineHeight: '1.75', marginBottom: '4px' }}>
        <span style={{ marginTop: '10px', height: '5px', width: '5px', borderRadius: '50%', background: '#20b8cd', flexShrink: 0, display: 'inline-block' }} />
        <span>{children}</span>
      </li>
    ),
    strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'white' }}>{children}</strong>,
    h1: ({ children }) => <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '10px', marginTop: '6px' }}>{children}</h1>,
    h2: ({ children }) => <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'white', marginBottom: '8px', marginTop: '6px' }}>{children}</h2>,
    h3: ({ children }) => <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e5e7eb', marginBottom: '6px' }}>{children}</h3>,
    code: ({ inline, children }) =>
      inline ? (
        <code style={{ background: '#1e2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '1px 6px', fontFamily: 'monospace', fontSize: '13px', color: '#20b8cd' }}>
          {children}
        </code>
      ) : (
        <code style={{ fontFamily: 'monospace', fontSize: '13px', color: '#20b8cd' }}>{children}</code>
      ),
    pre: ({ children }) => (
      <pre style={{ margin: '10px 0', overflowX: 'auto', borderRadius: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px', fontSize: '13px', lineHeight: '1.6' }}>
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{ borderLeft: '2px solid #20b8cd', paddingLeft: '14px', color: '#9ca3af', fontStyle: 'italic', margin: '10px 0' }}>
        {children}
      </blockquote>
    ),
    hr: () => null,
    a: ({ children, href }) => (
      <a href={href} style={{ color: '#20b8cd', textDecoration: 'underline', textUnderlineOffset: '3px' }}>{children}</a>
    ),
  }
}

// ── VAULT BADGE — shows which NeuroVault items were used ──
const VaultBadge = ({ vaultSources }) => {
  if (!vaultSources?.length) return null

  return (
    <div style={{
      marginTop: '10px',
      background: 'rgba(124,58,237,0.07)',
      border: '1px solid rgba(124,58,237,0.2)',
      borderRadius: '10px',
      padding: '8px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px' }}>🧠</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {vaultSources.length} item{vaultSources.length !== 1 ? 's' : ''} from your NeuroVault
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {vaultSources.map(item => (
          <a
            key={item.id}
            href={item.url || import.meta.env.VITE_VAULT_URL || 'vault'}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 8px', borderRadius: '7px',
              background: 'rgba(124,58,237,0.05)',
              textDecoration: 'none', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.05)'}
          >
            <span style={{ fontSize: '11px', flexShrink: 0 }}>
              {item.type === 'youtube' ? '▶️' : item.type === 'note' ? '📝' : item.type === 'tweet' ? '🐦' : '📄'}
            </span>
            <span style={{
              flex: 1, fontSize: '12px', color: '#c4b5fd',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {item.title}
            </span>
            {item.category && (
              <span style={{
                fontSize: '10px', color: '#7c3aed',
                background: 'rgba(124,58,237,0.15)', padding: '2px 6px',
                borderRadius: '4px', flexShrink: 0
              }}>
                {item.category}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}

// ── VAULT CONNECT — connect/disconnect NeuroVault ──
const VaultConnect = () => {
  const dispatch = useDispatch()
  const neuroVaultUserId = useSelector(state => state.chat.neuroVaultUserId)
  const [showForm, setShowForm] = useState(false)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle') // idle | testing | error

  const handleConnect = async () => {
    if (!input.trim()) return
    setStatus('testing')
    try {
      const res = await fetch(
        `${import.meta.env.VITE_VAULT_API_URL}/api/content?user_id=${input.trim()}`,
        { signal: AbortSignal.timeout(3000) }
      )
      const data = await res.json()
      if (data.success !== false) {
        dispatch(setNeuroVaultUserId(input.trim()))
        setShowForm(false)
        setInput('')
        setStatus('idle')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const handleDisconnect = () => {
    dispatch(setNeuroVaultUserId(null))
    setShowForm(false)
    setStatus('idle')
  }

  // Already connected
  if (neuroVaultUserId && !showForm) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: '#10b981' }}>NeuroVault</span>
        <button
          onClick={handleDisconnect}
          style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          disconnect
        </button>
      </div>
    )
  }

  if (showForm) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Paste your NeuroVault User ID..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleConnect()}
          autoFocus
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.4)',
            borderRadius: '7px', padding: '4px 10px', color: '#e0e0ff',
            fontSize: '12px', outline: 'none', minWidth: '200px', fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleConnect}
          disabled={status === 'testing'}
          style={{
            background: '#7c3aed', color: 'white', border: 'none',
            borderRadius: '7px', padding: '4px 12px', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          {status === 'testing' ? '...' : 'Connect'}
        </button>
        <button
          onClick={() => { setShowForm(false); setStatus('idle') }}
          style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
        {status === 'error' && (
          <span style={{ fontSize: '11px', color: '#ef4444', width: '100%' }}>
            ❌ Failed — is NeuroVault running on port 5000?
          </span>
        )}
      </div>
    )
  }

  return (
    <button
  onClick={() => setShowForm(true)}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',

    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.35)',
    borderRadius: '8px',

    padding: '5px 12px',
    color: '#ffffff', // 🔥 white text
    fontSize: '12px',
    fontWeight: '500',

    cursor: 'pointer',
    fontFamily: 'inherit',

    transition: 'all 0.2s ease',

    // 🔥 glow effect
    boxShadow: '0 0 8px rgba(124,58,237,0.5)',
  }}

  onMouseEnter={e => {
    e.currentTarget.style.background = 'rgba(124,58,237,0.25)';
    e.currentTarget.style.boxShadow = '0 0 14px rgba(124,58,237,0.8)';
    e.currentTarget.style.transform = 'translateY(-1px)';
  }}

  onMouseLeave={e => {
    e.currentTarget.style.background = 'rgba(124,58,237,0.15)';
    e.currentTarget.style.boxShadow = '0 0 8px rgba(124,58,237,0.5)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
Connect NeuroVault
</button>
  )
}

// SIDEBAR
const Sidebar = ({ chats, currentChatId, onOpenChat, onNewChat, onLogout, onClose, isMobile, user }) => {
  const chatList = Object.values(chats)
  const userName = user?.name || user?.email?.split('@')[0] || null

  const getInitials = () => {
    if (user?.name) return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
    if (user?.email) return user.email[0].toUpperCase() || 'U'
    return 'U'
  }

  const formatTitle = (title) =>
    (title || 'Untitled').replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080b14', width: '100%' }}>

      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            height: '32px', width: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #20b8cd, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(32,184,205,0.4)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.3"/>
              <path d="m21 21-4.35-4.35" stroke="white" strokeWidth="2.3" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'white', letterSpacing: '-0.5px', fontFamily: "'Sora', sans-serif" }}>IntelliSeek</span>
        </div>
        {isMobile && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#6b7280' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* New Chat */}
      <div style={{ padding: '0 10px 14px' }}>
        <button onClick={onNewChat} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
          padding: '9px 13px', borderRadius: '11px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          fontSize: '14px', color: '#9ca3af', cursor: 'pointer', transition: 'all 0.15s',
          fontFamily: 'inherit'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9ca3af' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New conversation
        </button>
      </div>

      <div style={{ margin: '0 10px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

      {/* Chat list — scrollbar hidden */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
        {chatList.length > 0 && (
          <p style={{ padding: '0 10px 8px', fontSize: '11px', fontWeight: 500, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            History
          </p>
        )}
        {chatList.map((c, i) => (
          <button
            key={i}
            onClick={() => { onOpenChat(c.id); onClose?.() }}
            style={{
              width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: '10px',
              fontSize: '14px', cursor: 'pointer', border: 'none', fontFamily: 'inherit',
              marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              transition: 'all 0.15s',
              background: c.id === currentChatId ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: c.id === currentChatId ? 'white' : '#6b7280',
            }}
            onMouseEnter={e => { if (c.id !== currentChatId) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#d1d5db' } }}
            onMouseLeave={e => { if (c.id !== currentChatId) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' } }}
          >
            {formatTitle(c.title)}
          </button>
        ))}
        {chatList.length === 0 && (
          <p style={{ padding: '6px 12px', fontSize: '13px', color: '#475569' }}>No conversations yet</p>
        )}
      </div>

      {/* Account */}
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            background: 'none', border: 'none', padding: '8px 10px',
            borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          title="Click to logout"
        >
          <div style={{
            height: '28px', width: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0
          }}>
            {getInitials()}
          </div>
          <span style={{ fontSize: '13px', color: '#6b7280', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {userName || 'My Account'}
          </span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// EMPTY STATE
const EmptyState = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%',
    textAlign: 'center', padding: '20px 24px 80px',
    position: 'relative', overflow: 'hidden'
  }}>

    {/* Subtle grid texture */}
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `linear-gradient(rgba(32,184,205,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(32,184,205,0.03) 1px, transparent 1px)`,
      backgroundSize: '48px 48px',
      maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%)'
    }} />

    {/* Glow bloom behind title */}
    <div style={{
      position: 'absolute', top: '28%', left: '50%', transform: 'translateX(-50%)',
      width: '480px', height: '220px', borderRadius: '50%',
      background: 'radial-gradient(ellipse, rgba(32,184,205,0.09) 0%, transparent 70%)',
      animation: 'floatOrb 6s ease-in-out infinite',
      pointerEvents: 'none'
    }} />

    {/* Main content */}
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>

      {/* Small eyebrow badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 14px', borderRadius: '999px',
        border: '1px solid rgba(32,184,205,0.2)',
        background: 'rgba(32,184,205,0.06)',
        marginBottom: '18px'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#20b8cd', boxShadow: '0 0 6px rgba(32,184,205,0.8)', animation: 'statusPulse 2.5s ease-in-out infinite', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#7dd3db', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase' }}>
          Ready to explore
        </span>
      </div>

      {/* Brand wordmark */}
      <h1 style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: '52px',
        fontWeight: 700,
        letterSpacing: '-2px',
        lineHeight: 1,
        marginBottom: '0px',
        background: 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 35%, #7dd3db 65%, #20b8cd 100%)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shimmer linear infinite',
      }}>
        IntelliSeek
      </h1>

      {/* Separator line */}
      <div style={{
        width: '280px', height: '1px', margin: '14px 0 14px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(32,184,205,0.4) 30%, rgba(14,165,233,0.5) 70%, transparent 100%)',
      }} />

      {/* Subtitle */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '16px',
        fontWeight: 400,
        color: '#94a3b8',
        letterSpacing: '0.01em',
        marginBottom: '20px',
        lineHeight: 1.6
      }}>
        Your intelligent research companion
      </p>

      {/* Animated placeholder */}
      <div style={{ minHeight: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
        <AnimatedPlaceholder />
      </div>

    </div>

  </div>
)

//  MAIN DASHBOARD

const Dashboard = () => {
  const chat = useChat()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [chatInput, setChatInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [animatedMessageKeys, setAnimatedMessageKeys] = useState(() => new Set())

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const user = useSelector((state) => state.auth.user)
  const isSending = useSelector((state) => state.chat.isSending)
  const chatError = useSelector((state) => state.chat.error)
  const neuroVaultUserId = useSelector((state) => state.chat.neuroVaultUserId)

  const handleLogout = () => { dispatch(logout()); navigate('/login') }
  const currentMessages = chats[currentChatId]?.messages ?? []

  useEffect(() => { chat.initializeSocketConnection(); chat.handleGetChats() }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages.length])

  const handleSend = useCallback(() => {
    const trimmed = chatInput.trim()
    if (!trimmed) return
    chat.handleSendMessage({ message: trimmed, chatId: currentChatId })
    setChatInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [chatInput, currentChatId])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleTextareaChange = (e) => {
    setChatInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
  }

  const canSend = chatInput.trim().length > 0

  const markMessageAnimated = useCallback((messageKey) => {
    setAnimatedMessageKeys((prev) => {
      if (prev.has(messageKey)) return prev
      const next = new Set(prev)
      next.add(messageKey)
      return next
    })
  }, [])

  let activeAnimatedMessageKey = null
  for (let index = currentMessages.length - 1; index >= 0; index--) {
    const message = currentMessages[index]
    const messageKey = `${message.role}-${index}-${message.content.substring(0, 20)}`

    if (message.role === 'ai' && message.animate && !animatedMessageKeys.has(messageKey)) {
      activeAnimatedMessageKey = messageKey
      break
    }
  }

  const handleStop = useCallback(() => {
    chat.handleStopResponse()

    if (activeAnimatedMessageKey) {
      markMessageAnimated(activeAnimatedMessageKey)
    }
  }, [activeAnimatedMessageKey, chat, markMessageAnimated])

  const showStopButton = isSending || Boolean(activeAnimatedMessageKey)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink       { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow   { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes statusPulse { 0%,100%{opacity:0.6} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes shimmer     { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes floatOrb    { 0%,100%{transform:translateY(0px) scale(1)} 50%{transform:translateY(-12px) scale(1.04)} }
        @keyframes chipFadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .msg-in { animation: fadeUp 0.22s ease forwards; }
        .scroll-area::-webkit-scrollbar { width: 4px; }
        .scroll-area::-webkit-scrollbar-track { background: transparent; }
        .scroll-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 99px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .md-sidebar     { display: none !important; }
        .mobile-topbar  { display: flex !important; }
        .desktop-topbar { display: none !important; }
        .suggestion-chip {
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(100,116,139,0.3);
          background: rgba(15,23,42,0.6);
          color: #94a3b8;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          backdrop-filter: blur(8px);
        }
        .suggestion-chip:hover {
          background: rgba(32,184,205,0.1);
          border-color: rgba(32,184,205,0.45);
          color: #a5f0f6;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(32,184,205,0.15);
        }
        @media (min-width: 768px) {
          .md-sidebar     { display: flex !important; flex-direction: column; }
          .mobile-topbar  { display: none !important; }
          .desktop-topbar { display: flex !important; }
        }
      `}</style>

      <div style={{
        fontFamily: "'DM Sans', -apple-system, sans-serif",
        display: 'flex', height: '100dvh', width: '100%',
        background: '#07090f', color: 'white', overflow: 'hidden'
      }}>

        {/* Desktop Sidebar */}
        <div className="md-sidebar" style={{ width: '252px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <Sidebar chats={chats} currentChatId={currentChatId} user={user}
            onOpenChat={(id) => chat.handleOpenChat(id, chats)}
            onNewChat={chat.handleNewChat} onLogout={handleLogout} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '272px', height: '100%' }}>
              <Sidebar chats={chats} currentChatId={currentChatId} user={user}
                onOpenChat={(id) => { chat.handleOpenChat(id, chats); setSidebarOpen(false) }}
                onNewChat={() => { chat.handleNewChat(); setSidebarOpen(false) }}
                onLogout={handleLogout} onClose={() => setSidebarOpen(false)} isMobile />
            </div>
          </div>
        )}

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100dvh' }}>

          {/* Mobile topbar */}
          <div className="mobile-topbar" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#07090f' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '7px', borderRadius: '10px', color: '#6b7280', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ height: '26px', width: '26px', borderRadius: '8px', background: 'linear-gradient(135deg, #20b8cd, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(32,184,205,0.35)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.5"/><path d="m21 21-4.35-4.35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>IntelliSeek</span>
            </div>
            <div style={{ width: '32px' }} />
          </div>

          {/* Desktop topbar — now includes VaultConnect */}
          <div className="desktop-topbar" style={{ padding: '10px 28px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: '#07090f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#20b8cd', boxShadow: '0 0 8px rgba(32,184,205,0.7)', animation: 'statusPulse 2.5s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#4b5563' }}>
                {chats[currentChatId]?.title
                  ? chats[currentChatId].title.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim()
                  : 'Ready To Go!'}
              </span>
            </div>
            {/* ── VAULT CONNECT in topbar ── */}
            <VaultConnect />
          </div>

          {/* Messages */}
          <div className="scroll-area" style={{ flex: 1, overflowY: 'auto' }}>
            {currentMessages.length === 0 ? (
              <EmptyState />
            ) : (
              <div style={{ maxWidth: '720px', margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {chatError && chatError !== 'Response stopped' && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1px solid rgba(248,113,113,0.25)',
                    background: 'rgba(127,29,29,0.2)',
                    color: '#fecaca',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    {chatError}
                  </div>
                )}
                {currentMessages.map((message, index) => {
                  const messageKey = `${message.role}-${index}-${message.content.substring(0, 20)}`
                  
                  const shouldAnimate =
                    message.role === 'ai' &&
                    message.animate &&
                    !animatedMessageKeys.has(messageKey)

                  return (
                    <div key={messageKey} className="msg-in">
                      {message.role === 'user' ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <div style={{ maxWidth: '72%', borderRadius: '18px', borderBottomRightRadius: '6px', background: '#111827', border: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px' }}>
                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#f3f4f6', margin: 0 }}>
                              {cleanText(message.content)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ marginTop: '2px', flexShrink: 0, height: '28px', width: '28px', borderRadius: '9px', background: 'rgba(32,184,205,0.1)', border: '1px solid rgba(32,184,205,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#20b8cd" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="#20b8cd" strokeWidth="2" strokeLinecap="round"/></svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                            {shouldAnimate ? (
                              <TypingText
                                key={messageKey}
                                content={message.content}
                                onComplete={() => markMessageAnimated(messageKey)}
                              />
                            ) : (
                              <StaticMarkdown content={message.content} />
                            )}
                            {/* ── VAULT BADGE below AI message ── */}
                            {message.vaultSources?.length > 0 && (
                              <VaultBadge vaultSources={message.vaultSources} />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={messagesEndRef} style={{ height: '8px' }} />
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 20px 20px', background: '#07090f' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              {/* Mobile VaultConnect — shown above input on small screens */}
              <div className="mobile-vault-connect" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <VaultConnect />
              </div>
              <div
                style={{
                  background: '#0d1120',
                  border: '2px solid rgba(0, 180, 255, 0.35)',
                  borderRadius: '16px',
                  padding: '14px 14px 10px 16px',
                  transition: 'all 0.25s ease'
                }}
                onFocusCapture={e => {
                  e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.6)';
                  e.currentTarget.style.boxShadow = `
                    0 0 6px rgba(0, 200, 255, 0.4),
                    0 0 12px rgba(0, 200, 255, 0.25)
                  `;
                }}
                onBlurCapture={e => {
                  e.currentTarget.style.borderColor = 'rgba(0, 180, 255, 0.25)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={chatInput}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={neuroVaultUserId ? 'Ask anything — vault + web...' : 'Ask anything...'}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: 'white', fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.65', overflow: 'hidden', display: 'block' }}
                />
                {showStopButton && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                    <button
                      onClick={handleStop}
                      style={{
                        height: '32px',
                        padding: '0 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(248,113,113,0.22)',
                        background: 'rgba(127,29,29,0.22)',
                        color: '#fca5a5',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '7px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'all 0.15s',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(127,29,29,0.38)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.38)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(127,29,29,0.22)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.22)' }}
                    >
                      <span style={{ width: '7px', height: '7px', borderRadius: '2px', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
                      Stop generating
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {chatInput.length > 0 ? `${chatInput.length} chars` : 'Enter ↵ to send · Shift+Enter for newline'}
                  </span>
                  <button
                    onClick={handleSend}
                    disabled={!canSend || isSending}
                    style={{
                      height: '34px', width: '34px', borderRadius: '10px', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: canSend && !isSending ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'all 0.15s',
                      background: canSend && !isSending ? 'linear-gradient(135deg, #20b8cd, #0ea5e9)' : 'rgba(255,255,255,0.06)',
                      boxShadow: canSend && !isSending ? '0 4px 14px rgba(14,165,233,0.4)' : 'none'
                    }}
                    onMouseEnter={e => { if (canSend && !isSending) { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(14,165,233,0.5)' } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = canSend && !isSending ? '0 4px 14px rgba(14,165,233,0.4)' : 'none' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p style={{ marginTop: '8px', textAlign: 'center', fontSize: '11px', color: '#475569' }}>
                IntelliSeek can make mistakes. Verify important information.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Dashboard