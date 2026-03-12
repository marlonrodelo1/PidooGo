export const PUBLIC_STORE_BASE_URL = 'https://pidoo.es'

export function buildStoreUrl(slug) {
  if (!slug) return ''
  return `${PUBLIC_STORE_BASE_URL}/${slug}`
}
