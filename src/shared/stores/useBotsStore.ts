import { create } from 'zustand'
import type { Bot } from '@/shared/types'

// 봇 목록 전역 Zustand 스토어
interface BotsState {
  bots: Bot[]
  // 봇 목록 전체 교체 (API 응답 반영)
  setBots: (bots: Bot[]) => void
  // 단일 봇 상태 업데이트 (WebSocket 실시간 반영)
  updateBot: (id: number, partial: Partial<Bot>) => void
}

export const useBotsStore = create<BotsState>((set) => ({
  bots: [],

  setBots: (bots) => set({ bots }),

  updateBot: (id, partial) =>
    set((state) => ({
      bots: state.bots.map((bot) => (bot.id === id ? { ...bot, ...partial } : bot)),
    })),
}))
