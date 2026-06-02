// API 기본 설정 — 백엔드 엔드포인트 변경 시 이 파일만 수정
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const WS_URL = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8000'

export const API = {
  bots: `${BASE_URL}/api/v1/bots`,
  botStart: (id: number) => `${BASE_URL}/api/v1/bots/${id}/start`,
  botStop: (id: number) => `${BASE_URL}/api/v1/bots/${id}/stop`,
  portfolio: (id: number) => `${BASE_URL}/api/v1/portfolio/${id}`,
  trades: (id: number) => `${BASE_URL}/api/v1/trades/${id}`,
} as const

export const WS = {
  live: (id: number) => `${WS_URL}/ws/live/${id}`,
} as const

// 표준 응답 타입
export type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}
