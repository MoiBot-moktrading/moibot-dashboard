import { useQuery, useQueries } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { API, type ApiResponse } from '@/shared/utils/api'
import type { Bot, Portfolio } from '@/shared/types'
import { formatKrw, formatPnlAmount, pnlColorClass } from '@/shared/utils/format'

async function fetchBots(): Promise<Bot[]> {
  const res = await fetch(API.bots)
  const json: ApiResponse<Bot[]> = await res.json()
  return json.data ?? []
}

async function fetchPortfolio(id: number): Promise<Portfolio | null> {
  const res = await fetch(API.portfolio(id))
  const json: ApiResponse<Portfolio | null> = await res.json()
  return json.data
}

// /dashboard — 전체 봇 포트폴리오 현황
export function DashboardIndexComponent() {
  const { data: bots = [], isLoading: botsLoading } = useQuery({
    queryKey: ['bots'],
    queryFn: fetchBots,
    refetchInterval: 30_000,
  })

  const portfolioResults = useQueries({
    queries: bots.map((bot) => ({
      queryKey: ['portfolio', bot.id],
      queryFn: () => fetchPortfolio(bot.id),
      refetchInterval: 30_000,
    })),
  })

  const portfolios = portfolioResults.map((r) => r.data ?? null)
  const totalPnl = portfolios.reduce((sum, p) => sum + (p?.pnl ?? 0), 0)
  const runningCount = bots.filter((b) => b.status === 'running').length

  if (botsLoading) {
    return <div className="p-8 text-gray-400">불러오는 중...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">대시보드</h1>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">전체 봇</p>
          <p className="text-2xl font-bold text-white">{bots.length}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">실행 중</p>
          <p className="text-2xl font-bold text-green-400">{runningCount}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">총 손익</p>
          <p className={`text-2xl font-bold ${pnlColorClass(totalPnl)}`}>
            {formatPnlAmount(totalPnl)} KRW
          </p>
        </div>
      </div>

      {/* 봇별 포트폴리오 행 */}
      {bots.length === 0 ? (
        <p className="text-gray-400 text-sm">
          봇이 없습니다.{' '}
          <Link to="/bots" className="text-cyan-400 hover:underline">봇 만들기</Link>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {bots.map((bot, i) => {
            const p = portfolios[i]
            return (
              <div key={bot.id} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    to="/bots/$botId"
                    params={{ botId: String(bot.id) }}
                    className="font-semibold text-white hover:text-cyan-400 transition-colors"
                  >
                    {bot.name}
                  </Link>
                  <span className="text-xs text-gray-500">{bot.strategy} · {bot.symbol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    bot.status === 'running'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-gray-700/30 text-gray-500'
                  }`}>
                    {bot.status === 'running' ? '실행 중' : '정지'}
                  </span>
                </div>
                {p ? (
                  <div className="flex items-center gap-8 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">잔고</p>
                      <p className="text-white">{formatKrw(p.balance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">손익</p>
                      <p className={pnlColorClass(p.pnl)}>{formatPnlAmount(p.pnl)} KRW</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">데이터 없음</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
