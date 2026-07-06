import type { ApiResponse } from '../types/skin'

const BASE_URL = 'http://localhost:8000'

export async function analyzeSkin(imageBase64: string): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/api/skin-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ image_base64: imageBase64 }),
  })

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data?.skin_report?.error) {
    throw new Error(data.skin_report.error)
  }

  return data
}
