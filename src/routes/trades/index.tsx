import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { API, type ApiResponse } from '@/shared/utils/api'
import type { Bot, Trade } from '@/shared/types'
import { formatKrw, formatDateTime } from '@/shared/utils/format'

async function fetchBots(): Promise<Bot[]> {
  const res = await fetch(API.bots)
  const json: ApiResponse<Bot[]> = await res.json()
  return json.data ?? []
}

async function fetchTrades(id: number): Promise<Trade[]> {
  const res = await fetch(API.trades(id))
  const json: ApiResponse<Trade[]> = await res.json()
  return json.data ?? []
}

// /trades — 봇 선택 후 거래이력 조회
export function TradesIndexComponent() {
  const { data: bots = [], isLoading: botsLoading } = useQuery({
    queryKey: ['bots'],
    queryFn: fetchBots,
  })

  const [selectedBotId, setSelectedBotId] = useState<number | null>(null)
  const activeBotId = selectedBotId ?? bots[0]?.id ?? null

  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['trades', activeBotId],
    queryFn: () => fetchTrades(activeBotId!),
    enabled: activeBotId !== null,
    refetchInterval: 30_000,
  })

  if (botsLoading) {
    return <div className="p-8 text-gray-400">불러오는 중...</div>
  }

  return (
    <div className="p-8 space-y-4">
      {/* 헤더 + 봇 셀렉터 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">거래 이력</h1>
        {bots.length > 0 && (
          <select
            className="bg-gray-800 text-gray-200 text-sm px-3 py-1.5 rounded-md border border-gray-700 focus:outline-none focus:border-cyan-500"
            value={activeBotId ?? ''}
            onChange={(e) => setSelectedBotId(Number(e.target.value))}
          >
            {bots.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.name} ({bot.symbol})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 콘텐츠 */}
      {bots.length === 0 ? (
        <p className="text-gray-400 text-sm">봇이 없습니다.</p>
      ) : tradesLoading ? (
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      ) : trades.length === 0 ? (
        <p className="text-gray-400 text-sm">거래 내역이 없습니다.</p>
      ) : (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left px-4 py-3">구분</th>
                <th className="text-right px-4 py-3">가격</th>
                <th className="text-right px-4 py-3">수량</th>
                <th className="text-right px-4 py-3">체결금액</th>
                <th className="text-right px-4 py-3">시각</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-2.5">
                    <span className={trade.side === 'buy' ? 'text-cyan-400' : 'text-red-400'}>
                      {trade.side === 'buy' ? '매수' : '매도'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-white">
                    {trade.price.toLocaleString('ko-KR')}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-300">
                    {trade.amount.toFixed(6)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-300">
                    {formatKrw(Math.round(trade.price * trade.amount))}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500">
                    {formatDateTime(trade.executed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
