// 봇 목록 카드 컴포넌트 — 시작/중지 버튼 포함
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@/shared/utils/api'
import type { Bot } from '@/shared/types'
import type { ApiResponse } from '@/shared/utils/api'

interface BotCardProps {
  bot: Bot
}

export function BotCard({ bot }: BotCardProps) {
  const queryClient = useQueryClient()

  const statusStyle =
    bot.status === 'running'
      ? 'text-green-500 bg-green-500/10'
      : 'text-gray-400 bg-gray-700/30'

  const strategyLabel: Record<string, string> = {
    ma_cross: 'MA 크로스',
    rsi: 'RSI',
    bollinger: '볼린저 밴드',
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const url = bot.status === 'running'
        ? API.botStop(bot.id)
        : API.botStart(bot.id)
      const res = await fetch(url, { method: 'PATCH' })
      return res.json() as Promise<ApiResponse<Bot>>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] })
    },
  })

  const isRunning = bot.status === 'running'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:border-cyan-500/40 transition-colors">
      <div className="flex items-start justify-between">
        <h3 className="text-white font-semibold text-lg">{bot.name}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyle}`}>
          {isRunning ? '실행 중' : '정지'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md font-medium">
          {strategyLabel[bot.strategy] ?? bot.strategy}
        </span>
        <span className="text-gray-400 text-sm">{bot.symbol}</span>
      </div>

      {/* 시작/중지 버튼 */}
      <button
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
          ${isRunning
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending
          ? '처리 중...'
          : isRunning ? '■ 중지' : '▶ 시작'}
      </button>
    </div>
  )
}
