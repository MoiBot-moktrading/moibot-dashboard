import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/routeTree.gen'
import './index.css'

// TanStack Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 창 포커스 시 자동 재요청 비활성화 (트레이딩 봇 데이터는 WebSocket으로 실시간 처리)
      refetchOnWindowFocus: false,
      // 에러 시 재시도 1회
      retry: 1,
      // 5분간 데이터 신선 유지
      staleTime: 5 * 60 * 1000,
    },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('루트 엘리먼트를 찾을 수 없습니다')

createRoot(rootElement).render(
  <StrictMode>
    {/* TanStack Query Provider */}
    <QueryClientProvider client={queryClient}>
      {/* TanStack Router Provider */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
