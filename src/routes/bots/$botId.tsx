import { useParams } from '@tanstack/react-router'

// /bots/$botId 동적 라우트 컴포넌트 — 봇 상세 (실시간 차트)
export function BotDetailComponent() {
  // URL 파라미터에서 botId 추출
  const { botId } = useParams({ strict: false }) as { botId: string }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">봇 상세</h1>
      <p className="text-gray-400">봇 ID: {botId}</p>
    </div>
  )
}
