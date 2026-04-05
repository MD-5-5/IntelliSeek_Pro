import styles from './VaultBadge.module.css'

export default function VaultBadge({ vaultSources }) {
  if (!vaultSources?.length) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.brain}>🧠</span>
        <span className={styles.label}>
          Referenced {vaultSources.length} item{vaultSources.length !== 1 ? 's' : ''} from your NeuroVault
        </span>
      </div>
      <div className={styles.items}>
        {vaultSources.map(item => (
          <a
            key={item.id}
            href={item.url || 'http://localhost:5173/vault'}
            target="_blank"
            rel="noreferrer"
            className={styles.item}
          >
            <span className={styles.icon}>
              {item.type === 'youtube' ? '▶️' :
               item.type === 'note' ? '📝' :
               item.type === 'tweet' ? '🐦' : '📄'}
            </span>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.category}>{item.category}</span>
          </a>
        ))}
      </div>
    </div>
  )
}