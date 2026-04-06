import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setNeuroVaultUserId } from '../chat.slice'
import styles from './VaultConnect.module.css'

export default function VaultConnect() {
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
  {
    method: "GET",
    headers: {
      "x-vault-api-key": import.meta.env.VITE_VAULT_API_KEY
    },
    signal: AbortSignal.timeout(3000)
  }
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
  if (neuroVaultUserId) {
    return (
      <div className={styles.connected}>
        <span className={styles.dot} />
        <span className={styles.text}>NeuroVault connected</span>
        <button className={styles.disconnect} onClick={handleDisconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  // Show connect form
  if (showForm) {
    return (
      <div className={styles.form}>
        <input
          type="text"
          placeholder="Paste your NeuroVault User ID..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleConnect()}
          className={styles.input}
          autoFocus
        />
        <button
          className={styles.connectBtn}
          onClick={handleConnect}
          disabled={status === 'testing'}
        >
          {status === 'testing' ? '...' : 'Connect'}
        </button>
        <button className={styles.cancel} onClick={() => { setShowForm(false); setStatus('idle') }}>
          Cancel
        </button>
        {status === 'error' && (
          <span className={styles.error}>
            ❌ Failed. Is NeuroVault running on port 5000?
          </span>
        )}
      </div>
    )
  }

  // Default — show connect button
  return (
    <button className={styles.connectPrompt} onClick={() => setShowForm(true)}>
        Connect NeuroVault
    </button>
  )
}