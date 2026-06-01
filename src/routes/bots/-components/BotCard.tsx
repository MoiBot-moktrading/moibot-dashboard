import type { Bot } from '@/shared/types'

interface BotCardProps {
  bot: Bot
}

export function BotCard({ bot }: BotCardProps) {
  const statusStyle =
    bot.status === 'running'
      ? 'text-green-500 bg-green-500/10'
      : 'text-gray-400 bg-gray-700/30'

  const strategyLabel: Record<string, string> = {
    ma_cross: 'MA 크로스',
    rsi: 'RSI',
    bollinger: '볼린저 밴드',
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:border-cyan-500/40 transition-colors">
      <div className="flex items-start justify-between">
        <h3 className="text-white font-semibold text-lg">{bot.name}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyle}`}>
          {bot.status === 'running' ? '실행 중' : '정지'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md font-medium">
          {strategyLabel[bot.strategy] ?? bot.strategy}
        </span>
        <span className="text-gray-400 text-sm">{bot.symbol}</span>
      </div>
    </div>
  )
}
