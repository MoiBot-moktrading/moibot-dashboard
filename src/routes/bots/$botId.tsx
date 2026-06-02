import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { API, WS, type ApiResponse } from '@/shared/utils/api'
import type { Bot, Portfolio, Trade } from '@/shared/types'
import { formatKrw, formatPnlAmount, pnlColorClass, formatDateTime } from '@/shared/utils/format'
import { useWebSocket } from '@/shared/hooks/useWebSocket'

type WsSnapshot = {
  balance: number
  position: number
  pnl: number
  snapshot_at: string
}

type WsMessage =
  | { type: 'history'; data: WsSnapshot[] }
  | { type: 'update'; data: WsSnapshot }

async function fetchBot(id: number): Promise<Bot> {
  const res = await fetch(API.bots)
  const json: ApiResponse<Bot[]> = await res.json()
  const bot = json.data.find((b) => b.id === id)
  if (!bot) throw new Error('봇을 찾을 수 없습니다')
  return bot
}

async function fetchPortfolio(id: number): Promise<Portfolio | null> {
  const res = await fetch(API.portfolio(id))
  const json: ApiResponse<Portfolio | null> = await res.json()
  return json.data
}

async function fetchTrades(id: number): Promise<Trade[]> {
  const res = await fetch(API.trades(id))
  const json: ApiResponse<Trade[]> = await res.json()
  return json.data ?? []
}

// /bots/$botId 동적 라우트 컴포넌트 — 봇 상세 (포트폴리오/거래이력/실시간 차트)
export function BotDetailComponent() {
  const { botId } = useParams({ strict: false }) as { botId: string }
  const id = Number(botId)

  const { data: bot, isLoading: botLoading } = useQuery({
    queryKey: ['bot', id],
    queryFn: () => fetchBot(id),
  })

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => fetchPortfolio(id),
    refetchInterval: 30_000,
  })

  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['trades', id],
    queryFn: () => fetchTrades(id),
    refetchInterval: 30_000,
  })

  // WebSocket 실시간 스냅샷 스트림
  const [wsSnapshots, setWsSnapshots] = useState<WsSnapshot[]>([])

  const handleWsMessage = useCallback((raw: unknown) => {
    const msg = raw as WsMessage
    if (msg.type === 'history') {
      setWsSnapshots(msg.data)
    } else if (msg.type === 'update') {
      setWsSnapshots((prev) => [...prev, msg.data])
    }
  }, [])

  const { connected } = useWebSocket(WS.live(id), { onMessage: handleWsMessage })

  // WS 데이터 우선, 없으면 REST 폴백
  const livePortfolio = wsSnapshots.length > 0 ? wsSnapshots[wsSnapshots.length - 1] : null

  if (botLoading) {
    return <div className="p-8 text-gray-400">불러오는 중...</div>
  }

  return (
    <div className="p-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link to="/bots" className="text-gray-400 hover:text-white transition-colors">
          ← 봇 목록
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {bot?.name ?? `봇 #${id}`}
        </h1>
        <span className={`text-sm px-2 py-0.5 rounded-full ${
          bot?.status === 'running'
            ? 'bg-green-500/10 text-green-400'
            : 'bg-gray-500/10 text-gray-400'
        }`}>
          {bot?.status === 'running' ? '실행 중' : '정지'}
        </span>
      </div>

      {/* WS 연결 상태 */}
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-600'}`} />
        <span className="text-xs text-gray-500">{connected ? '실시간 연결됨' : '연결 중...'}</span>
      </div>

      {/* 봇 정보 */}
      {bot && (
        <div className="bg-gray-900 rounded-lg p-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">전략</p>
            <p className="text-white font-medium">{bot.strategy}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">심볼</p>
            <p className="text-white font-medium">{bot.symbol}</p>
          </div>
        </div>
      )}

      {/* 포트폴리오 */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-4">포트폴리오</h2>
        {portfolioLoading && !livePortfolio ? (
          <p className="text-gray-400 text-sm">불러오는 중...</p>
        ) : (livePortfolio ?? portfolio) ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">잔고</p>
              <p className="text-white font-medium">{formatKrw((livePortfolio ?? portfolio)!.balance)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">보유수량</p>
              <p className="text-white font-medium">{(livePortfolio ?? portfolio)!.position.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">손익</p>
              <p className={`font-medium ${pnlColorClass((livePortfolio ?? portfolio)!.pnl)}`}>
                {formatPnlAmount((livePortfolio ?? portfolio)!.pnl)} KRW
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">거래 데이터 없음 (봇을 시작하면 데이터가 쌓입니다)</p>
        )}
      </div>

      {/* PnL 차트 */}
      {wsSnapshots.length > 1 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-4">PnL 추이</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wsSnapshots}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="snapshot_at"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={(v: string) => new Date(v).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '6px' }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: number) => [`${value.toLocaleString('ko-KR')} KRW`, 'PnL']}
                labelFormatter={(label: string) => new Date(label).toLocaleString('ko-KR')}
              />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#06b6d4"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 거래 이력 */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-4">거래 이력</h2>
        {tradesLoading ? (
          <p className="text-gray-400 text-sm">불러오는 중...</p>
        ) : trades.length === 0 ? (
          <p className="text-gray-400 text-sm">거래 내역 없음</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left pb-2">구분</th>
                  <th className="text-right pb-2">가격</th>
                  <th className="text-right pb-2">수량</th>
                  <th className="text-right pb-2">체결금액</th>
                  <th className="text-right pb-2">시각</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-800/50">
                    <td className="py-2">
                      <span className={trade.side === 'buy' ? 'text-cyan-400' : 'text-red-400'}>
                        {trade.side === 'buy' ? '매수' : '매도'}
                      </span>
                    </td>
                    <td className="py-2 text-right text-white">
                      {trade.price.toLocaleString('ko-KR')}
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {trade.amount.toFixed(6)}
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {formatKrw(Math.round(trade.price * trade.amount))}
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {formatDateTime(trade.executed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
