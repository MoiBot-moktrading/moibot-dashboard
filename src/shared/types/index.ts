// 공통 도메인 타입 정의

// 트레이딩 봇 엔티티
export type Bot = {
  id: number
  name: string
  strategy: string
  symbol: string
  status: 'running' | 'stopped'
}

// 체결 거래 이력
export type Trade = {
  id: number
  botId: number
  side: 'buy' | 'sell'
  price: number
  amount: number
  executedAt: string
}

// 포트폴리오 스냅샷
export type Portfolio = {
  botId: number
  balance: number
  position: number
  pnl: number
  snapshotAt: string
}
