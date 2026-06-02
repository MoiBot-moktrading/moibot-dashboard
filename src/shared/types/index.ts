// 공통 도메인 타입 정의

// 트레이딩 봇 엔티티
export type Bot = {
  id: number
  name: string
  strategy: string
  symbol: string
  status: 'running' | 'stopped'
}

// 체결 거래 이력 (API 응답 snake_case)
export type Trade = {
  id: number
  bot_id: number
  side: 'buy' | 'sell'
  price: number
  amount: number
  executed_at: string
}

// 포트폴리오 스냅샷 (API 응답 snake_case)
export type Portfolio = {
  id: number
  bot_id: number
  balance: number
  position: number
  pnl: number
  snapshot_at: string
}
