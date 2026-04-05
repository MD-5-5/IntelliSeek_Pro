import axios from 'axios'

const NEUROVAULT_URL = process.env.NEUROVAULT_URL || 'http://localhost:5000'

export async function getVaultContext(query, neuroVaultUserId) {
  if (!neuroVaultUserId || !query) return []

  try {
    const res = await axios.post(
      `${NEUROVAULT_URL}/api/search/vault-context`,
      {
        query,
        user_id: neuroVaultUserId,
        limit: 4
      },
      { timeout: 3000 } // 3s timeout — don't slow down IntelliSeek if vault is down
    )

    return res.data?.results || []
  } catch (err) {
    // NeuroVault offline or slow — IntelliSeek still works normally
    console.warn('NeuroVault not available:', err.message)
    return []
  }
}


export function formatVaultContext(vaultResults) {
  if (!vaultResults?.length) return null

  return vaultResults.map((item, i) =>
    `[Vault Item ${i + 1}]
Title: ${item.title}
Type: ${item.type}
Summary: ${item.summary}
Tags: ${item.tags?.join(', ') || 'none'}
${item.url ? `Source: ${item.url}` : ''}`
  ).join('\n\n')
}