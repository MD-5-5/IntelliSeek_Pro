import axios from 'axios'

const NEUROVAULT_URL = process.env.NEUROVAULT_URL || 'http://localhost:5000'
const VAULT_API_KEY = process.env.VAULT_API_KEY || ''

export async function getVaultContext(query, neuroVaultUserId) {
  if (!neuroVaultUserId || !query) return []

  try {
    console.log(`🔵 [NeuroVault] Fetching vault data for user: ${neuroVaultUserId}`)
    
    const res = await axios.get(
      `${NEUROVAULT_URL}/api/content`,
      {
        params: {
          user_id: neuroVaultUserId,
          query: query  // Send query as param for filtering
        },
        headers: {
          'x-vault-api-key': VAULT_API_KEY
        },
        timeout: 3000 // 3s timeout — don't slow down IntelliSeek if vault is down
      }
    )

    // NeuroVault returns { success: true, content: [...] }
    const vaultContent = res.data?.content || []
    console.log(`🟢 [NeuroVault] Retrieved ${vaultContent.length} items from vault`)
    return vaultContent
  } catch (err) {
    // NeuroVault offline or slow — IntelliSeek still works normally
    console.warn('⚠️  [NeuroVault] Not available:', err.message)
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