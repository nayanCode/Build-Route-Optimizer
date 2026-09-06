// This is the single place the frontend knows about the Python API address.
// A deployment can override it with VITE_API_BASE_URL without changing code.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export async function reverseGeocode(latitude, longitude) {
  const query = new URLSearchParams({ latitude, longitude })
  const response = await fetch(`${API_BASE_URL}/geocode/reverse?${query}`)

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail ?? 'The address could not be updated.')
  }

  return response.json()
}

export async function validateRoute(route) {
  const response = await fetch(`${API_BASE_URL}/routes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(route),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail ?? 'The backend could not validate these stops.')
  }

  return response.json()
}

export async function optimizeRoute(route) {
  const response = await fetch(`${API_BASE_URL}/routes/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(route),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail ?? 'The backend could not optimize this route.')
  }

  return response.json()
}
