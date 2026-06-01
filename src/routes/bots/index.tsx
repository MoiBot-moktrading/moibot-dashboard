// 봇 목록 페이지 — GET /api/v1/bots 연동 + 봇 생성 모달
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { API } from '@/shared/utils/api'
import { useBotsStore } from '@/shared/stores/useBotsStore'
import { BotCard } from './-components/BotCard'
import { CreateBotModal } from './-components/CreateBotModal'
import type { Bot } from '@/shared/types'
import type { ApiResponse } from '@/shared/utils/api'

export function BotsIndexComponent() {
  const [showModal, setShowModal] = useState(false)
  const setBots = useBotsStore((s) => s.setBots)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const res = await fetch(API.bots)
      const json = (await res.json()) as ApiResponse<Bot[]>
      setBots(json.data)
      return json.data
    },
  })

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">트레이딩 봇</h1>
          <p className="text-gray-400 text-sm mt-1">AI 자동매매 봇 관리</p>
        </div>
        <button
          className="bg-cyan-500 text-gray-950 font-semibold px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
          onClick={() => setShowModal(true)}
        >
          + 봇 추가
        </button>
      </div>

      {/* 상태별 렌더링 */}
      {isLoading && (
        <p className="text-gray-400">불러오는 중...</p>
      )}
      {isError && (
        <p className="text-red-500">봇 목록을 불러오지 못했습니다.</p>
      )}
      {data && data.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">🤖</p>
          <p>등록된 봇이 없습니다</p>
          <p className="text-sm mt-1">+ 봇 추가 버튼으로 첫 봇을 만들어보세요</p>
        </div>
      )}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      )}

      {/* 생성 모달 */}
      {showModal && <CreateBotModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
