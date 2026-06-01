// 봇 생성 모달 컴포넌트
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@/shared/utils/api'
import type { Bot } from '@/shared/types'
import type { ApiResponse } from '@/shared/utils/api'

interface CreateBotModalProps {
  onClose: () => void
}

const STRATEGIES = [
  { value: 'ma_cross', label: 'MA 크로스' },
  { value: 'rsi', label: 'RSI' },
  { value: 'bollinger', label: '볼린저 밴드' },
] as const

export function CreateBotModal({ onClose }: CreateBotModalProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', strategy: 'rsi', symbol: 'BTC/KRW' })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(API.bots, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      return res.json() as Promise<ApiResponse<Bot>>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-white font-bold text-xl mb-5">봇 추가</h2>

        <div className="flex flex-col gap-4">
          {/* 봇 이름 */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">봇 이름</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="내 RSI 봇"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* 전략 */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">전략</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              value={form.strategy}
              onChange={(e) => setForm((f) => ({ ...f, strategy: e.target.value }))}
            >
              {STRATEGIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* 심볼 */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">심볼</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="BTC/KRW"
              value={form.symbol}
              onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
            />
          </div>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm mt-3">생성 중 오류가 발생했습니다.</p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 bg-gray-800 text-gray-300 rounded-lg py-2 hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="flex-1 bg-cyan-500 text-gray-950 font-semibold rounded-lg py-2 hover:bg-cyan-400 transition-colors disabled:opacity-50"
            disabled={mutation.isPending || !form.name}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? '생성 중...' : '봇 추가'}
          </button>
        </div>
      </div>
    </div>
  )
}
